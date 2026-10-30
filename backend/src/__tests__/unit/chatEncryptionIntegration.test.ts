import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  chatbot,
  getChatHistory,
  clearChatHistory
} from "../../controllers/chatbotcontroller";
import { getRecentActivities } from "../../controllers/quizController";
import { ChatHistory } from "../../models/ChatHistory";
import { MockTrial } from "../../models/Mocktrial/Mock";
import { Attempts } from "../../models/quiz/userQuizAttempt";
import { redisGet, redisSet, redisDel, isRedisAvailable } from "../../utils/redisClient";
import {
  encryptMessage,
  decryptMessage,
  isEncryptedMessage
} from "../../utils/cryptoUtils";
import { AuthenticatedRequest } from "../../types/express";

jest.mock("../../models/ChatHistory");
jest.mock("../../models/Mocktrial/Mock");
jest.mock("../../models/quiz/userQuizAttempt");
jest.mock("../../utils/redisClient");

describe("Chat Encryption & Decryption Integration Tests", () => {
  const validHexKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  const originalEnvKey = process.env.CHAT_ENCRYPTION_KEY;
  const originalFetch = global.fetch;

  beforeAll(() => {
    process.env.CHAT_ENCRYPTION_KEY = validHexKey;
    process.env.GOOGLE_GEMINI_API_KEY = "test-gemini-key";
  });

  afterAll(() => {
    process.env.CHAT_ENCRYPTION_KEY = originalEnvKey;
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (isRedisAvailable as jest.Mock).mockReturnValue(true);
    (redisDel as jest.Mock).mockResolvedValue(true);
    (redisSet as jest.Mock).mockResolvedValue(true);
  });

  const createMockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  describe("MongoDB Chat Persistence (chatbot)", () => {
    test("encrypts user and bot messages before persisting in MongoDB with atomic historyVersion increment and invalidates previous cache", async () => {
      const mockUserId = "507f1f77bcf86cd799439011";
      const userPrompt = "What are the penalties under IPC 420?";
      const botReply = "IPC 420 deals with cheating and dishonestly inducing delivery of property.";

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: botReply }]
              }
            }
          ]
        })
      } as any);

      (ChatHistory.findOne as jest.Mock).mockResolvedValue(null);
      (ChatHistory.findOneAndUpdate as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        historyVersion: 1
      });

      const req = {
        body: { message: userPrompt },
        user: { id: mockUserId }
      } as unknown as AuthenticatedRequest;

      const res = createMockResponse();

      await chatbot(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ reply: botReply });

      expect(ChatHistory.findOneAndUpdate).toHaveBeenCalledTimes(1);
      const updateCallArgs = (ChatHistory.findOneAndUpdate as jest.Mock).mock.calls[0];
      expect(updateCallArgs[0]).toEqual({ userId: mockUserId });

      expect(updateCallArgs[1].$inc).toEqual({ historyVersion: 1 });
      const pushedMessages = updateCallArgs[1].$push.messages.$each;
      expect(pushedMessages).toHaveLength(2);

      const pushedUserMessage = pushedMessages[0];
      const pushedBotMessage = pushedMessages[1];

      expect(pushedUserMessage.sender).toBe("user");
      expect(pushedUserMessage.encryptionVersion).toBe("v1");
      expect(isEncryptedMessage(pushedUserMessage.content)).toBe(true);
      expect(pushedUserMessage.content).not.toBe(userPrompt);
      expect(decryptMessage(pushedUserMessage.content)).toBe(userPrompt);

      expect(pushedBotMessage.sender).toBe("bot");
      expect(pushedBotMessage.encryptionVersion).toBe("v1");
      expect(isEncryptedMessage(pushedBotMessage.content)).toBe(true);
      expect(pushedBotMessage.content).not.toBe(botReply);
      expect(decryptMessage(pushedBotMessage.content)).toBe(botReply);

      expect(redisDel).toHaveBeenCalledWith(`app:chat:v3:history:user:${mockUserId}:0`);
      expect(redisSet).not.toHaveBeenCalled();
    });

    test("handles MongoDB persistence failure safely without updating Redis or leaking internal details", async () => {
      const mockUserId = "507f1f77bcf86cd799439011";
      const userPrompt = "Question during DB outage";
      const botReply = "Answer from AI";

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: botReply }]
              }
            }
          ]
        })
      } as any);

      (ChatHistory.findOne as jest.Mock).mockResolvedValue(null);
      (ChatHistory.findOneAndUpdate as jest.Mock).mockRejectedValue(new Error("Mongo connection timeout"));

      const req = {
        body: { message: userPrompt },
        user: { id: mockUserId }
      } as unknown as AuthenticatedRequest;

      const res = createMockResponse();

      await chatbot(req, res);

      expect(res.status).toHaveBeenCalledWith(502);
      expect(res.json).toHaveBeenCalledWith({ error: "AI service failed" });
      expect(redisDel).not.toHaveBeenCalled();
      expect(redisSet).not.toHaveBeenCalled();
    });

    test("concurrent chatbot requests persist all messages and atomically increment historyVersion", async () => {
      const mockUserId = "507f1f77bcf86cd799439011";
      const userPrompt1 = "First question";
      const botReply1 = "First answer";
      const userPrompt2 = "Second question";
      const botReply2 = "Second answer";

      const persistedStore: any[] = [];
      let currentVersion = 0;

      (ChatHistory.findOneAndUpdate as jest.Mock).mockImplementation(async (_query, update) => {
        if (update?.$push?.messages?.$each) {
          persistedStore.push(...update.$push.messages.$each);
        }
        if (update?.$inc?.historyVersion) {
          currentVersion += update.$inc.historyVersion;
        }
        return { userId: mockUserId, messages: persistedStore, historyVersion: currentVersion };
      });

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            candidates: [{ content: { parts: [{ text: botReply1 }] } }]
          })
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            candidates: [{ content: { parts: [{ text: botReply2 }] } }]
          })
        } as any);

      (ChatHistory.findOne as jest.Mock).mockResolvedValue(null);

      const req1 = {
        body: { message: userPrompt1 },
        user: { id: mockUserId }
      } as unknown as AuthenticatedRequest;
      const res1 = createMockResponse();

      const req2 = {
        body: { message: userPrompt2 },
        user: { id: mockUserId }
      } as unknown as AuthenticatedRequest;
      const res2 = createMockResponse();

      await Promise.all([chatbot(req1, res1), chatbot(req2, res2)]);

      expect(res1.status).toHaveBeenCalledWith(200);
      expect(res2.status).toHaveBeenCalledWith(200);
      expect(persistedStore).toHaveLength(4);
      expect(currentVersion).toBe(2);

      (ChatHistory.findOne as jest.Mock).mockImplementation((_query, projection) => {
        if (projection?.historyVersion) {
          return Promise.resolve({ userId: mockUserId, historyVersion: currentVersion });
        }
        return Promise.resolve({ userId: mockUserId, messages: persistedStore, historyVersion: currentVersion });
      });

      (redisGet as jest.Mock).mockResolvedValue(null);

      const getReq = { user: { id: mockUserId } } as unknown as AuthenticatedRequest;
      const getRes = createMockResponse();

      await getChatHistory(getReq, getRes);

      expect(getRes.status).toHaveBeenCalledWith(200);
      const returnedHistory = (getRes.json as jest.Mock).mock.calls[0][0];
      expect(returnedHistory).toHaveLength(4);
      expect(returnedHistory[0].content).toBe(userPrompt1);
      expect(returnedHistory[1].content).toBe(botReply1);
      expect(returnedHistory[2].content).toBe(userPrompt2);
      expect(returnedHistory[3].content).toBe(botReply2);

      expect(redisSet).toHaveBeenCalledWith(
        `app:chat:v3:history:user:${mockUserId}:2`,
        expect.any(String),
        3600
      );
    });

    test("fails safely and prevents corrupted or undecrypted messages from reaching Gemini", async () => {
      const mockUserId = "507f1f77bcf86cd799439011";
      const userPrompt = "How to file a consumer complaint?";

      global.fetch = jest.fn();

      (ChatHistory.findOne as jest.Mock).mockImplementation((_query, projection) => {
        if (projection?.historyVersion) {
          return Promise.resolve({ userId: mockUserId, historyVersion: 1 });
        }
        return Promise.resolve({
          userId: mockUserId,
          historyVersion: 1,
          messages: [
            {
              sender: "user",
              content: "v1:0123456789abcdef01234567:0123456789abcdef0123456789abcdef:deadbeef",
              encryptionVersion: "v1"
            }
          ]
        });
      });

      const req = {
        body: { message: userPrompt },
        user: { id: mockUserId }
      } as unknown as AuthenticatedRequest;

      const res = createMockResponse();

      await chatbot(req, res);

      expect(res.status).toHaveBeenCalledWith(502);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: "AI service failed"
      }));
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("supports legacy unencrypted messages when constructing Gemini conversation context", async () => {
      const mockUserId = "507f1f77bcf86cd799439011";
      const legacyUserPrompt = "What is an FIR?";
      const userPrompt = "Can police refuse to file an FIR?";
      const botReply = "Police cannot refuse to register an FIR for cognizable offences.";

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: botReply }]
              }
            }
          ]
        })
      } as any);

      (ChatHistory.findOne as jest.Mock).mockImplementation((_query, projection) => {
        if (projection?.historyVersion) {
          return Promise.resolve({ userId: mockUserId, historyVersion: 1 });
        }
        return Promise.resolve({
          userId: mockUserId,
          historyVersion: 1,
          messages: [
            { sender: "user", content: legacyUserPrompt }
          ]
        });
      });
      (ChatHistory.findOneAndUpdate as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        historyVersion: 2
      });

      const req = {
        body: { message: userPrompt },
        user: { id: mockUserId }
      } as unknown as AuthenticatedRequest;

      const res = createMockResponse();

      await chatbot(req, res);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const fetchBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(fetchBody.contents).toEqual([
        { role: "user", parts: [{ text: legacyUserPrompt }] },
        { role: "user", parts: [{ text: userPrompt }] }
      ]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ reply: botReply });
    });
  });

  describe("Redis and MongoDB Reads (getChatHistory)", () => {
    const mockUserId = "507f1f77bcf86cd799439011";

    test("reads from encrypted Redis cache when version matches MongoDB authoritative version", async () => {
      const plaintextMessages = [
        { sender: "user", content: "Can I get anticipatory bail?", createdAt: new Date() },
        { sender: "bot", content: "Yes, under Section 438 CrPC.", createdAt: new Date() }
      ];

      (ChatHistory.findOne as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        historyVersion: 3
      });

      const encryptedRedisPayload = encryptMessage(JSON.stringify(plaintextMessages));
      (redisGet as jest.Mock).mockResolvedValue(encryptedRedisPayload);

      const req = {
        user: { id: mockUserId }
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await getChatHistory(req, res);

      expect(ChatHistory.findOne).toHaveBeenCalledWith({ userId: mockUserId }, { historyVersion: 1 });
      expect(redisGet).toHaveBeenCalledWith(`app:chat:v3:history:user:${mockUserId}:3`);
      expect(res.status).toHaveBeenCalledWith(200);

      const responsePayload = (res.json as jest.Mock).mock.calls[0][0];
      expect(responsePayload).toHaveLength(2);
      expect(responsePayload[0].content).toBe(plaintextMessages[0].content);
      expect(responsePayload[1].content).toBe(plaintextMessages[1].content);
    });

    test("rejects obsolete cache version when MongoDB authoritative version is newer", async () => {
      const oldCachedMessages = [
        { sender: "user", content: "Stale message from version 1", createdAt: new Date() }
      ];
      const freshMongoMessages = [
        {
          sender: "user",
          content: encryptMessage("Fresh message in version 2"),
          encryptionVersion: "v1",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      (redisGet as jest.Mock).mockImplementation((key: string) => {
        if (key.endsWith(":1")) {
          return Promise.resolve(encryptMessage(JSON.stringify(oldCachedMessages)));
        }
        return Promise.resolve(null);
      });

      (ChatHistory.findOne as jest.Mock).mockImplementation((_query, projection) => {
        if (projection?.historyVersion) {
          return Promise.resolve({ userId: mockUserId, historyVersion: 2 });
        }
        return Promise.resolve({
          userId: mockUserId,
          historyVersion: 2,
          messages: freshMongoMessages
        });
      });

      const req = { user: { id: mockUserId } } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await getChatHistory(req, res);

      expect(redisGet).toHaveBeenCalledWith(`app:chat:v3:history:user:${mockUserId}:2`);
      expect(res.status).toHaveBeenCalledWith(200);

      const responseData = (res.json as jest.Mock).mock.calls[0][0];
      expect(responseData).toHaveLength(1);
      expect(responseData[0].content).toBe("Fresh message in version 2");
      expect(responseData[0].content).not.toContain("Stale");

      expect(redisSet).toHaveBeenCalledWith(
        `app:chat:v3:history:user:${mockUserId}:2`,
        expect.any(String),
        3600
      );
    });

    test("Redis DEL failure does not compromise correctness because obsolete versions are ignored", async () => {
      (redisDel as jest.Mock).mockResolvedValue(false);

      (ChatHistory.findOne as jest.Mock).mockImplementation((_query, projection) => {
        if (projection?.historyVersion) {
          return Promise.resolve({ userId: mockUserId, historyVersion: 5 });
        }
        return Promise.resolve({
          userId: mockUserId,
          historyVersion: 5,
          messages: [
            {
              sender: "user",
              content: encryptMessage("Version 5 content"),
              encryptionVersion: "v1",
              createdAt: new Date("2026-06-01T10:00:00.000Z").toISOString()
            }
          ]
        });
      });

      (redisGet as jest.Mock).mockImplementation((key: string) => {
        if (key.endsWith(":4")) {
          return Promise.resolve(encryptMessage(JSON.stringify([{ sender: "user", content: "Version 4 content" }])));
        }
        return Promise.resolve(null);
      });

      const req = { user: { id: mockUserId } } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await getChatHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = (res.json as jest.Mock).mock.calls[0][0];
      expect(responseData[0].content).toBe("Version 5 content");
    });

    test("multiple simulated backend instances observe identical state via MongoDB authoritative versioning", async () => {
      const sharedStore = {
        userId: mockUserId,
        historyVersion: 3,
        messages: [
          {
            sender: "user",
            content: encryptMessage("Cross-instance shared message"),
            encryptionVersion: "v1",
            createdAt: new Date("2026-06-01T10:00:00.000Z").toISOString()
          }
        ]
      };

      (ChatHistory.findOne as jest.Mock).mockImplementation((_query, projection) => {
        if (projection?.historyVersion) {
          return Promise.resolve({ userId: mockUserId, historyVersion: sharedStore.historyVersion });
        }
        return Promise.resolve(sharedStore);
      });

      (redisGet as jest.Mock).mockResolvedValue(null);

      const instanceAReq = { user: { id: mockUserId } } as unknown as AuthenticatedRequest;
      const instanceARes = createMockResponse();
      await getChatHistory(instanceAReq, instanceARes);

      expect(instanceARes.status).toHaveBeenCalledWith(200);
      const instanceAResponse = (instanceARes.json as jest.Mock).mock.calls[0][0];

      (redisGet as jest.Mock).mockResolvedValue(
        encryptMessage(JSON.stringify(instanceAResponse))
      );

      const instanceBReq = { user: { id: mockUserId } } as unknown as AuthenticatedRequest;
      const instanceBRes = createMockResponse();
      await getChatHistory(instanceBReq, instanceBRes);

      expect(instanceBRes.status).toHaveBeenCalledWith(200);
      const instanceBResponse = (instanceBRes.json as jest.Mock).mock.calls[0][0];

      expect(instanceAResponse).toEqual(instanceBResponse);
      expect(instanceBResponse[0].content).toBe("Cross-instance shared message");
    });

    test("redis cache miss rebuilds complete history from MongoDB", async () => {
      const messages = [
        { sender: "user", content: encryptMessage("Message 1"), encryptionVersion: "v1", createdAt: new Date() },
        { sender: "bot", content: encryptMessage("Message 2"), encryptionVersion: "v1", createdAt: new Date() },
        { sender: "user", content: encryptMessage("Message 3"), encryptionVersion: "v1", createdAt: new Date() }
      ];

      (redisGet as jest.Mock).mockResolvedValue(null);
      (ChatHistory.findOne as jest.Mock).mockImplementation((_query, projection) => {
        if (projection?.historyVersion) {
          return Promise.resolve({ userId: mockUserId, historyVersion: 1 });
        }
        return Promise.resolve({
          userId: mockUserId,
          historyVersion: 1,
          messages
        });
      });

      const req = { user: { id: mockUserId } } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await getChatHistory(req, res);

      expect(redisSet).toHaveBeenCalledWith(
        `app:chat:v3:history:user:${mockUserId}:1`,
        expect.any(String),
        3600
      );

      const cachedPayload = (redisSet as jest.Mock).mock.calls[0][1];
      const parsedCached = JSON.parse(decryptMessage(cachedPayload));
      expect(parsedCached).toHaveLength(3);
      expect(parsedCached[0].content).toBe("Message 1");
      expect(parsedCached[1].content).toBe("Message 2");
      expect(parsedCached[2].content).toBe("Message 3");
    });

    test("returns identical structure from Redis and MongoDB without exposing encryptionVersion", async () => {
      const createdDate = new Date("2026-06-01T10:00:00Z");
      const updatedDate = new Date("2026-06-01T10:05:00Z");
      const sampleMessages = [
        {
          sender: "user",
          content: encryptMessage("Question for structure test"),
          encryptionVersion: "v1",
          createdAt: createdDate,
          updatedAt: updatedDate
        }
      ];

      (redisGet as jest.Mock).mockResolvedValue(null);
      (ChatHistory.findOne as jest.Mock).mockImplementation((_query, projection) => {
        if (projection?.historyVersion) {
          return Promise.resolve({ userId: mockUserId, historyVersion: 1 });
        }
        return Promise.resolve({
          userId: mockUserId,
          historyVersion: 1,
          messages: sampleMessages
        });
      });

      const reqMongo = { user: { id: mockUserId } } as unknown as AuthenticatedRequest;
      const resMongo = createMockResponse();
      await getChatHistory(reqMongo, resMongo);
      const mongoResponse = (resMongo.json as jest.Mock).mock.calls[0][0];

      const cachedData = [
        {
          sender: "user",
          content: "Question for structure test",
          createdAt: createdDate.toISOString(),
          updatedAt: updatedDate.toISOString(),
          encryptionVersion: "v1"
        }
      ];
      (redisGet as jest.Mock).mockResolvedValue(encryptMessage(JSON.stringify(cachedData)));

      const reqRedis = { user: { id: mockUserId } } as unknown as AuthenticatedRequest;
      const resRedis = createMockResponse();
      await getChatHistory(reqRedis, resRedis);
      const redisResponse = (resRedis.json as jest.Mock).mock.calls[0][0];

      expect(Object.keys(mongoResponse[0]).sort()).toEqual(["content", "createdAt", "sender", "updatedAt"].sort());
      expect(Object.keys(redisResponse[0]).sort()).toEqual(["content", "createdAt", "sender", "updatedAt"].sort());
      expect(mongoResponse[0].encryptionVersion).toBeUndefined();
      expect(redisResponse[0].encryptionVersion).toBeUndefined();
      expect(redisResponse[0].content).toBe(mongoResponse[0].content);
    });

    test("handles corrupted Redis cache by deleting invalid entry and reading MongoDB", async () => {
      const plainUserText = "Query about consumer court";
      (redisGet as jest.Mock).mockResolvedValue("v1:invalid:badtag:deadbeef");
      (ChatHistory.findOne as jest.Mock).mockImplementation((_query, projection) => {
        if (projection?.historyVersion) {
          return Promise.resolve({ userId: mockUserId, historyVersion: 1 });
        }
        return Promise.resolve({
          userId: mockUserId,
          historyVersion: 1,
          messages: [
            {
              sender: "user",
              content: encryptMessage(plainUserText),
              encryptionVersion: "v1"
            }
          ]
        });
      });

      const req = {
        user: { id: mockUserId }
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await getChatHistory(req, res);

      expect(redisDel).toHaveBeenCalledWith(`app:chat:v3:history:user:${mockUserId}:1`);
      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = (res.json as jest.Mock).mock.calls[0][0];
      expect(responseData[0].content).toBe(plainUserText);
    });

    test("preserves legacy unencrypted messages when reading from MongoDB", async () => {
      const legacyText = "Legacy unencrypted message content";
      (redisGet as jest.Mock).mockResolvedValue(null);
      (ChatHistory.findOne as jest.Mock).mockImplementation((_query, projection) => {
        if (projection?.historyVersion) {
          return Promise.resolve({ userId: mockUserId, historyVersion: 0 });
        }
        return Promise.resolve({
          userId: mockUserId,
          historyVersion: 0,
          messages: [
            {
              sender: "user",
              content: legacyText
            }
          ]
        });
      });

      const req = {
        user: { id: mockUserId }
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await getChatHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = (res.json as jest.Mock).mock.calls[0][0];
      expect(responseData[0].content).toBe(legacyText);
    });
  });

  describe("Clear Chat History", () => {
    test("clears messages array and atomically increments historyVersion in database", async () => {
      const mockUserId = "507f1f77bcf86cd799439011";
      (ChatHistory.findOneAndUpdate as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        historyVersion: 4
      });

      const req = {
        user: { id: mockUserId }
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await clearChatHistory(req, res);

      expect(ChatHistory.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: mockUserId },
        {
          $set: { messages: [] },
          $inc: { historyVersion: 1 }
        },
        { new: true }
      );
      expect(redisDel).toHaveBeenCalledWith(`app:chat:v3:history:user:${mockUserId}:3`);
      expect(redisDel).toHaveBeenCalledWith(`app:chat:v3:history:user:${mockUserId}:4`);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("handles database failure during deletion safely", async () => {
      const mockUserId = "507f1f77bcf86cd799439011";
      (ChatHistory.findOneAndUpdate as jest.Mock).mockRejectedValue(new Error("Database write error"));

      const req = {
        user: { id: mockUserId }
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await clearChatHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to clear chat history" });
    });
  });

  describe("Quiz Recent Activities Decryption & Error Sanitization", () => {
    test("decrypts encrypted user messages and creates truncated activity description", async () => {
      const mockUserId = new mongoose.Types.ObjectId();
      const secretConsultation = "I was unfairly terminated from my employment without severance pay or notice";
      const encryptedConsultation = encryptMessage(secretConsultation);

      (Attempts.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([])
            })
          })
        })
      });

      (MockTrial.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([])
            })
          })
        })
      });

      (ChatHistory.findOne as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        messages: [
          {
            sender: "user",
            content: encryptedConsultation,
            encryptionVersion: "v1",
            createdAt: new Date("2026-05-01T10:00:00Z")
          },
          {
            sender: "bot",
            content: encryptMessage("You can file a claim before the labour commissioner."),
            encryptionVersion: "v1",
            createdAt: new Date("2026-05-01T10:01:00Z")
          }
        ]
      });

      const req = {
        user: { id: mockUserId.toString() },
        query: { limit: "5" }
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await getRecentActivities(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const activities = (res.json as jest.Mock).mock.calls[0][0].activities;
      expect(activities).toHaveLength(1);

      const chatActivity = activities[0];
      expect(chatActivity.type).toBe("chat");
      expect(chatActivity.title).toBe("AI Consultation");
      expect(chatActivity.description).toBe(secretConsultation.substring(0, 50) + "...");
      expect(chatActivity.description).not.toContain("v1:");
    });

    test("quiz API sanitizes internal errors and does not expose err.message", async () => {
      const mockUserId = new mongoose.Types.ObjectId();
      (Attempts.find as jest.Mock).mockImplementation(() => {
        throw new Error("Internal database pool exhausted: connection refused at 10.0.0.5");
      });

      const req = {
        user: { id: mockUserId.toString() }
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await getRecentActivities(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Something went wrong" });
      const returnedPayload = (res.json as jest.Mock).mock.calls[0][0];
      expect(returnedPayload.error).toBeUndefined();
      expect(JSON.stringify(returnedPayload)).not.toContain("Internal database pool exhausted");
    });
  });
});
