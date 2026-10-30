import mongoose from "mongoose";
import { runChatMigration } from "../../scripts/migrateChatEncryption";
import { ChatHistory } from "../../models/ChatHistory";
import { encryptMessage, decryptMessage, isEncryptedMessage } from "../../utils/cryptoUtils";

jest.mock("../../models/ChatHistory");

describe("Chat Encryption Migration Unit Tests", () => {
  const validHexKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  const originalEnvKey = process.env.CHAT_ENCRYPTION_KEY;

  beforeAll(() => {
    process.env.CHAT_ENCRYPTION_KEY = validHexKey;
  });

  afterAll(() => {
    process.env.CHAT_ENCRYPTION_KEY = originalEnvKey;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockCursor = (docs: any[]) => {
    return {
      async *[Symbol.asyncIterator]() {
        for (const doc of docs) {
          yield doc;
        }
      }
    };
  };

  test("dry-run mode identifies unencrypted messages without performing database updates", async () => {
    const mockDoc = {
      _id: new mongoose.Types.ObjectId(),
      updatedAt: new Date(),
      messages: [
        { sender: "user", content: "Unencrypted message one" },
        { sender: "bot", content: "Unencrypted message two" },
        { sender: "user", content: encryptMessage("Already encrypted message"), encryptionVersion: "v1" }
      ]
    };

    (ChatHistory.find as jest.Mock).mockReturnValue({
      cursor: jest.fn().mockReturnValue(createMockCursor([mockDoc]))
    });

    const result = await runChatMigration({ dryRun: true });

    expect(result.isDryRun).toBe(true);
    expect(result.scannedDocuments).toBe(1);
    expect(result.migratedMessages).toBe(2);
    expect(result.skippedDocuments).toBe(0);
    expect(result.failedRecords).toBe(0);

    expect(ChatHistory.updateOne).not.toHaveBeenCalled();
  });

  test("idempotency: skips documents where all messages have encryptionVersion v1", async () => {
    const mockDoc = {
      _id: new mongoose.Types.ObjectId(),
      updatedAt: new Date(),
      messages: [
        { sender: "user", content: encryptMessage("First encrypted message"), encryptionVersion: "v1" },
        { sender: "bot", content: encryptMessage("Second encrypted message"), encryptionVersion: "v1" }
      ]
    };

    (ChatHistory.find as jest.Mock).mockReturnValue({
      cursor: jest.fn().mockReturnValue(createMockCursor([mockDoc]))
    });

    const result = await runChatMigration({ dryRun: false });

    expect(result.scannedDocuments).toBe(1);
    expect(result.migratedMessages).toBe(0);
    expect(result.skippedDocuments).toBe(1);
    expect(result.failedRecords).toBe(0);

    expect(ChatHistory.updateOne).not.toHaveBeenCalled();
  });

  test("unsupported encryption versions are reported as failures and never counted as migrated", async () => {
    const mockDoc = {
      _id: new mongoose.Types.ObjectId(),
      updatedAt: new Date(),
      messages: [
        { sender: "user", content: "v2:0123:data", encryptionVersion: "v2" },
        { sender: "bot", content: "Unencrypted response" }
      ]
    };

    (ChatHistory.find as jest.Mock).mockReturnValue({
      cursor: jest.fn().mockReturnValue(createMockCursor([mockDoc]))
    });

    const result = await runChatMigration({ dryRun: false });

    expect(result.scannedDocuments).toBe(1);
    expect(result.migratedMessages).toBe(0);
    expect(result.failedRecords).toBe(1);
    expect(ChatHistory.updateOne).not.toHaveBeenCalled();
  });

  test("live migration performs targeted positional updates with content-based concurrency filter", async () => {
    const docId = new mongoose.Types.ObjectId();
    const originalDate = new Date("2026-05-01T12:00:00Z");

    const mockDoc = {
      _id: docId,
      updatedAt: originalDate,
      messages: [
        { sender: "user", content: "Unencrypted text" },
        { sender: "bot", content: encryptMessage("Already encrypted text"), encryptionVersion: "v1" }
      ]
    };

    (ChatHistory.find as jest.Mock).mockReturnValue({
      cursor: jest.fn().mockReturnValue(createMockCursor([mockDoc]))
    });

    (ChatHistory.updateOne as jest.Mock).mockResolvedValue({
      matchedCount: 1,
      modifiedCount: 1
    });

    const result = await runChatMigration({ dryRun: false });

    expect(result.scannedDocuments).toBe(1);
    expect(result.migratedMessages).toBe(1);
    expect(result.skippedDocuments).toBe(0);
    expect(result.failedRecords).toBe(0);

    expect(ChatHistory.updateOne).toHaveBeenCalledTimes(1);
    const updateArgs = (ChatHistory.updateOne as jest.Mock).mock.calls[0];

    expect(updateArgs[0]).toEqual({
      _id: docId,
      updatedAt: originalDate,
      "messages.0.content": "Unencrypted text"
    });

    const setPayload = updateArgs[1].$set;
    expect(setPayload["messages.0.content"]).toBeDefined();
    expect(setPayload["messages.0.encryptionVersion"]).toBe("v1");
    expect(isEncryptedMessage(setPayload["messages.0.content"])).toBe(true);
    expect(decryptMessage(setPayload["messages.0.content"])).toBe("Unencrypted text");
    expect(setPayload["messages.1.content"]).toBeUndefined();
  });

  test("concurrency safety: retries with refreshed document when optimistic concurrency conflict occurs", async () => {
    const docId = new mongoose.Types.ObjectId();
    const staleDate = new Date("2026-05-01T12:00:00Z");
    const freshDate = new Date("2026-05-01T12:00:01Z");

    const staleDoc = {
      _id: docId,
      updatedAt: staleDate,
      messages: [
        { sender: "user", content: "Original message" }
      ]
    };

    const freshDoc = {
      _id: docId,
      updatedAt: freshDate,
      messages: [
        { sender: "user", content: "Original message" },
        { sender: "user", content: encryptMessage("Concurrent user message"), encryptionVersion: "v1" },
        { sender: "bot", content: encryptMessage("Concurrent bot message"), encryptionVersion: "v1" }
      ]
    };

    (ChatHistory.find as jest.Mock).mockReturnValue({
      cursor: jest.fn().mockReturnValue(createMockCursor([staleDoc]))
    });

    (ChatHistory.updateOne as jest.Mock)
      .mockResolvedValueOnce({ matchedCount: 0, modifiedCount: 0 })
      .mockResolvedValueOnce({ matchedCount: 1, modifiedCount: 1 });

    (ChatHistory.findById as jest.Mock).mockResolvedValue(freshDoc);

    const result = await runChatMigration({ dryRun: false });

    expect(result.scannedDocuments).toBe(1);
    expect(result.migratedMessages).toBe(1);
    expect(result.failedRecords).toBe(0);

    expect(ChatHistory.updateOne).toHaveBeenCalledTimes(2);

    const firstUpdateArgs = (ChatHistory.updateOne as jest.Mock).mock.calls[0];
    expect(firstUpdateArgs[0]).toEqual({
      _id: docId,
      updatedAt: staleDate,
      "messages.0.content": "Original message"
    });

    const secondUpdateArgs = (ChatHistory.updateOne as jest.Mock).mock.calls[1];
    expect(secondUpdateArgs[0]).toEqual({
      _id: docId,
      updatedAt: freshDate,
      "messages.0.content": "Original message"
    });
  });

  test("concurrency safety: recalculates indices when concurrent update changes message array", async () => {
    const docId = new mongoose.Types.ObjectId();
    const staleDate = new Date("2026-05-01T12:00:00Z");
    const freshDate = new Date("2026-05-01T12:00:01Z");

    const staleDoc = {
      _id: docId,
      updatedAt: staleDate,
      messages: [
        { sender: "user", content: "Original unencrypted message" }
      ]
    };

    const freshDoc = {
      _id: docId,
      updatedAt: freshDate,
      messages: [
        { sender: "user", content: "Original unencrypted message" },
        { sender: "user", content: "Second unencrypted message added concurrently" },
        { sender: "bot", content: encryptMessage("Concurrent bot message already encrypted"), encryptionVersion: "v1" }
      ]
    };

    (ChatHistory.find as jest.Mock).mockReturnValue({
      cursor: jest.fn().mockReturnValue(createMockCursor([staleDoc]))
    });

    (ChatHistory.updateOne as jest.Mock)
      .mockResolvedValueOnce({ matchedCount: 0, modifiedCount: 0 })
      .mockResolvedValueOnce({ matchedCount: 1, modifiedCount: 1 });

    (ChatHistory.findById as jest.Mock).mockResolvedValue(freshDoc);

    const result = await runChatMigration({ dryRun: false });

    expect(result.scannedDocuments).toBe(1);
    expect(result.migratedMessages).toBe(2);
    expect(result.failedRecords).toBe(0);

    expect(ChatHistory.updateOne).toHaveBeenCalledTimes(2);

    const secondUpdateArgs = (ChatHistory.updateOne as jest.Mock).mock.calls[1];
    expect(secondUpdateArgs[0]).toEqual({
      _id: docId,
      updatedAt: freshDate,
      "messages.0.content": "Original unencrypted message",
      "messages.1.content": "Second unencrypted message added concurrently"
    });
    const setPayload = secondUpdateArgs[1].$set;
    expect(setPayload["messages.0.content"]).toBeDefined();
    expect(setPayload["messages.0.encryptionVersion"]).toBe("v1");
    expect(setPayload["messages.1.content"]).toBeDefined();
    expect(setPayload["messages.1.encryptionVersion"]).toBe("v1");
    expect(setPayload["messages.2.content"]).toBeUndefined();
  });

  test("failure counter accuracy: malformed document increments failedRecords exactly once", async () => {
    const mockDoc = {
      _id: new mongoose.Types.ObjectId(),
      updatedAt: new Date(),
      messages: [
        { sender: "user", content: 12345 },
        { sender: "bot", content: null }
      ]
    };

    (ChatHistory.find as jest.Mock).mockReturnValue({
      cursor: jest.fn().mockReturnValue(createMockCursor([mockDoc]))
    });

    const result = await runChatMigration({ dryRun: false });

    expect(result.scannedDocuments).toBe(1);
    expect(result.migratedMessages).toBe(0);
    expect(result.failedRecords).toBe(1);
  });

  test("failure counter accuracy: unresolvable concurrent collision increments failedRecords exactly once", async () => {
    const docId = new mongoose.Types.ObjectId();
    const mockDoc = {
      _id: docId,
      updatedAt: new Date("2026-05-01T12:00:00Z"),
      messages: [
        { sender: "user", content: "Unencrypted message" }
      ]
    };

    (ChatHistory.find as jest.Mock).mockReturnValue({
      cursor: jest.fn().mockReturnValue(createMockCursor([mockDoc]))
    });

    (ChatHistory.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 0, modifiedCount: 0 });
    (ChatHistory.findById as jest.Mock).mockResolvedValue(null);

    const result = await runChatMigration({ dryRun: false });

    expect(result.scannedDocuments).toBe(1);
    expect(result.migratedMessages).toBe(0);
    expect(result.failedRecords).toBe(1);
  });

  test("metadata validation: explicit null encryptionVersion is reported as failed record and never migrated", async () => {
    const mockDoc = {
      _id: new mongoose.Types.ObjectId(),
      updatedAt: new Date(),
      messages: [
        { sender: "user", content: "Message with null metadata", encryptionVersion: null },
        { sender: "bot", content: "Normal response" }
      ]
    };

    (ChatHistory.find as jest.Mock).mockReturnValue({
      cursor: jest.fn().mockReturnValue(createMockCursor([mockDoc]))
    });

    const result = await runChatMigration({ dryRun: false });

    expect(result.scannedDocuments).toBe(1);
    expect(result.migratedMessages).toBe(0);
    expect(result.failedRecords).toBe(1);
    expect(ChatHistory.updateOne).not.toHaveBeenCalled();
  });

  test("metadata validation: empty string encryptionVersion is reported as failed record and never migrated", async () => {
    const mockDoc = {
      _id: new mongoose.Types.ObjectId(),
      updatedAt: new Date(),
      messages: [
        { sender: "user", content: "Message with empty string metadata", encryptionVersion: "" }
      ]
    };

    (ChatHistory.find as jest.Mock).mockReturnValue({
      cursor: jest.fn().mockReturnValue(createMockCursor([mockDoc]))
    });

    const result = await runChatMigration({ dryRun: false });

    expect(result.scannedDocuments).toBe(1);
    expect(result.migratedMessages).toBe(0);
    expect(result.failedRecords).toBe(1);
    expect(ChatHistory.updateOne).not.toHaveBeenCalled();
  });
});
