import crypto from "crypto";
import {
  validateEncryptionKey,
  encryptMessage,
  decryptMessage,
  isEncryptedMessage,
  resolveStoredMessage,
  ENCRYPTION_VERSION
} from "../../utils/cryptoUtils";

describe("cryptoUtils Unit Tests", () => {
  const originalEnvKey = process.env.CHAT_ENCRYPTION_KEY;
  const validHexKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  const alternateValidHexKey = "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210";

  beforeEach(() => {
    process.env.CHAT_ENCRYPTION_KEY = validHexKey;
  });

  afterAll(() => {
    process.env.CHAT_ENCRYPTION_KEY = originalEnvKey;
  });

  describe("validateEncryptionKey", () => {
    test("returns 32-byte buffer for valid 64-character hex key", () => {
      const buffer = validateEncryptionKey(validHexKey);
      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBe(32);
    });

    test("reads from environment when key is omitted", () => {
      const buffer = validateEncryptionKey();
      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBe(32);
    });

    test("throws error when environment variable is missing", () => {
      delete process.env.CHAT_ENCRYPTION_KEY;
      expect(() => validateEncryptionKey()).toThrow(
        "Application startup failed: CHAT_ENCRYPTION_KEY environment variable is required"
      );
    });

    test("throws error when key length is less than 64 hex characters", () => {
      expect(() => validateEncryptionKey("0123456789abcdef")).toThrow(
        "Application startup failed: CHAT_ENCRYPTION_KEY must be a 64-character hexadecimal string"
      );
    });

    test("throws error when key length is greater than 64 hex characters", () => {
      expect(() => validateEncryptionKey(validHexKey + "aa")).toThrow(
        "Application startup failed: CHAT_ENCRYPTION_KEY must be a 64-character hexadecimal string"
      );
    });

    test("throws error when key contains non-hex characters", () => {
      const invalidCharsKey = "g" + validHexKey.slice(1);
      expect(() => validateEncryptionKey(invalidCharsKey)).toThrow(
        "Application startup failed: CHAT_ENCRYPTION_KEY must be a 64-character hexadecimal string"
      );
    });
  });

  describe("encryptMessage & decryptMessage Round Trip", () => {
    test("successfully encrypts and decrypts standard ASCII text", () => {
      const text = "Hello legal assistant, I need legal help regarding property inheritance.";
      const encrypted = encryptMessage(text);
      expect(isEncryptedMessage(encrypted)).toBe(true);
      const decrypted = decryptMessage(encrypted);
      expect(decrypted).toBe(text);
    });

    test("produces different ciphertexts for identical plaintext due to random IV", () => {
      const text = "Identical message for random IV test";
      const encrypted1 = encryptMessage(text);
      const encrypted2 = encryptMessage(text);
      expect(encrypted1).not.toBe(encrypted2);
      expect(decryptMessage(encrypted1)).toBe(text);
      expect(decryptMessage(encrypted2)).toBe(text);
    });

    test("handles empty string correctly", () => {
      const emptyText = "";
      const encrypted = encryptMessage(emptyText);
      expect(isEncryptedMessage(encrypted)).toBe(true);
      const decrypted = decryptMessage(encrypted);
      expect(decrypted).toBe(emptyText);
    });

    test("handles Unicode, Hindi, Marathi, and Hinglish messages with emojis", () => {
      const unicodeCases = [
        "नमस्ते! क्या मुझे अग्रिम जमानत मिल सकती है? ⚖️",
        "IPC 302 vs BNS 103: kya farak hai bhai? Please explain in detail.",
        "माझे वडील मला मालमत्तेतून बेदखल करू शकतात का? 📜",
        "Legal advice: ₹50,000 cheque bounce case under Section 138 NI Act."
      ];

      for (const message of unicodeCases) {
        const encrypted = encryptMessage(message);
        const decrypted = decryptMessage(encrypted);
        expect(decrypted).toBe(message);
      }
    });

    test("accepts Buffer instance as custom key", () => {
      const keyBuffer = crypto.randomBytes(32);
      const text = "Testing Buffer key";
      const encrypted = encryptMessage(text, keyBuffer);
      const decrypted = decryptMessage(encrypted, keyBuffer);
      expect(decrypted).toBe(text);
    });

    test("throws when key buffer length is not 32 bytes", () => {
      const badBuffer = crypto.randomBytes(16);
      expect(() => encryptMessage("Test", badBuffer)).toThrow(
        "Encryption key buffer must be exactly 32 bytes"
      );
    });

    test("throws TypeError when plaintext is not a string", () => {
      expect(() => encryptMessage(null as unknown as string)).toThrow(TypeError);
      expect(() => encryptMessage(undefined as unknown as string)).toThrow(TypeError);
      expect(() => encryptMessage(123 as unknown as string)).toThrow(TypeError);
    });
  });

  describe("Tampering & Security Failure Modes", () => {
    test("throws on wrong decryption key", () => {
      const text = "Secret message";
      const encrypted = encryptMessage(text, validHexKey);
      expect(() => decryptMessage(encrypted, alternateValidHexKey)).toThrow(
        "Decryption failed: authentication tag mismatch or corrupted data"
      );
    });

    test("throws on tampered ciphertext", () => {
      const text = "Confidential client notes";
      const encrypted = encryptMessage(text);
      const parts = encrypted.split(":");
      const tamperedCiphertext = parts[3].slice(0, -2) + (parts[3].endsWith("aa") ? "bb" : "aa");
      const tamperedPayload = `${parts[0]}:${parts[1]}:${parts[2]}:${tamperedCiphertext}`;

      expect(() => decryptMessage(tamperedPayload)).toThrow(
        "Decryption failed: authentication tag mismatch or corrupted data"
      );
    });

    test("throws on tampered authentication tag", () => {
      const text = "Important message";
      const encrypted = encryptMessage(text);
      const parts = encrypted.split(":");
      const tamperedAuthTag = (parts[2].startsWith("00") ? "11" : "00") + parts[2].slice(2);
      const tamperedPayload = `${parts[0]}:${parts[1]}:${tamperedAuthTag}:${parts[3]}`;

      expect(() => decryptMessage(tamperedPayload)).toThrow(
        "Decryption failed: authentication tag mismatch or corrupted data"
      );
    });

    test("throws on tampered IV", () => {
      const text = "Verification message";
      const encrypted = encryptMessage(text);
      const parts = encrypted.split(":");
      const tamperedIv = (parts[1].startsWith("00") ? "11" : "00") + parts[1].slice(2);
      const tamperedPayload = `${parts[0]}:${tamperedIv}:${parts[2]}:${parts[3]}`;

      expect(() => decryptMessage(tamperedPayload)).toThrow(
        "Decryption failed: authentication tag mismatch or corrupted data"
      );
    });
  });

  describe("Envelope Format Strict Validation", () => {
    test("throws on invalid envelope parts count", () => {
      expect(() => decryptMessage("v1:abc:def")).toThrow("Invalid encrypted payload envelope");
      expect(() => decryptMessage("v1:a:b:c:d")).toThrow("Invalid encrypted payload envelope");
    });

    test("throws on unsupported version", () => {
      expect(() => decryptMessage("v2:0123456789abcdef01234567:0123456789abcdef0123456789abcdef:1234")).toThrow(
        "Unsupported encryption version: v2"
      );
    });

    test("throws on invalid IV length", () => {
      expect(() => decryptMessage("v1:1234:0123456789abcdef0123456789abcdef:1234")).toThrow(
        "Invalid IV in encrypted payload envelope"
      );
    });

    test("throws on invalid auth tag length", () => {
      expect(() => decryptMessage("v1:0123456789abcdef01234567:1234:1234")).toThrow(
        "Invalid authentication tag in encrypted payload envelope"
      );
    });

    test("throws on invalid non-hex ciphertext", () => {
      expect(() => decryptMessage("v1:0123456789abcdef01234567:0123456789abcdef0123456789abcdef:zzzz")).toThrow(
        "Invalid ciphertext in encrypted payload envelope"
      );
    });

    test("throws on odd length ciphertext hex", () => {
      expect(() => decryptMessage("v1:0123456789abcdef01234567:0123456789abcdef0123456789abcdef:123")).toThrow(
        "Invalid ciphertext in encrypted payload envelope"
      );
    });

    test("throws TypeError when payload is not a string", () => {
      expect(() => decryptMessage(123 as unknown as string)).toThrow(TypeError);
    });
  });

  describe("isEncryptedMessage", () => {
    test("returns true for versioned envelope prefixes", () => {
      expect(isEncryptedMessage("v1:something")).toBe(true);
      expect(isEncryptedMessage("v2:something")).toBe(true);
      expect(isEncryptedMessage("v10:something")).toBe(true);
      expect(isEncryptedMessage(encryptMessage("hello"))).toBe(true);
    });

    test("returns false for plaintext or non-versioned strings", () => {
      expect(isEncryptedMessage("Hello world")).toBe(false);
      expect(isEncryptedMessage("v:something")).toBe(false);
      expect(isEncryptedMessage("version1:something")).toBe(false);
      expect(isEncryptedMessage("")).toBe(false);
      expect(isEncryptedMessage(null as unknown as string)).toBe(false);
    });
  });

  describe("resolveStoredMessage (Explicit Encryption Metadata & Legacy Support)", () => {
    test("treats undefined encryptionVersion as legacy plaintext", () => {
      const legacyCases = [
        "v1: This is a legacy question about IPC 302",
        "v1:0123:not-really-encrypted-just-user-text",
        "Standard plaintext question without prefix"
      ];

      for (const text of legacyCases) {
        expect(resolveStoredMessage({ content: text, encryptionVersion: undefined })).toBe(text);
        expect(resolveStoredMessage({ content: text })).toBe(text);
      }
    });

    test("decrypts message with explicit v1 encryptionVersion metadata", () => {
      const plaintext = "Confidential client consultation";
      const encrypted = encryptMessage(plaintext);
      const storedMessage = {
        content: encrypted,
        encryptionVersion: "v1"
      };

      expect(resolveStoredMessage(storedMessage)).toBe(plaintext);
    });

    test("throws error when encryptionVersion is explicitly null", () => {
      const storedMessage = {
        content: "Plaintext with null version",
        encryptionVersion: null as unknown as string
      };

      expect(() => resolveStoredMessage(storedMessage)).toThrow(
        "Invalid or unsupported encryption version: null"
      );
    });

    test("throws error when encryptionVersion is empty string", () => {
      const storedMessage = {
        content: "Plaintext with empty string version",
        encryptionVersion: ""
      };

      expect(() => resolveStoredMessage(storedMessage)).toThrow(
        "Invalid or unsupported encryption version: "
      );
    });

    test("throws error for unsupported encryption versions", () => {
      const storedMessageV2 = {
        content: "v2:0123456789abcdef01234567:0123456789abcdef0123456789abcdef:1234",
        encryptionVersion: "v2"
      };
      const storedMessageCustom = {
        content: "some content",
        encryptionVersion: "aes-gcm-legacy"
      };

      expect(() => resolveStoredMessage(storedMessageV2)).toThrow(
        "Invalid or unsupported encryption version: v2"
      );
      expect(() => resolveStoredMessage(storedMessageCustom)).toThrow(
        "Invalid or unsupported encryption version: aes-gcm-legacy"
      );
    });

    test("throws TypeError when stored message content is missing or non-string", () => {
      expect(() => resolveStoredMessage(null as any)).toThrow(TypeError);
      expect(() => resolveStoredMessage({ content: 12345 as any })).toThrow(TypeError);
    });
  });
});
