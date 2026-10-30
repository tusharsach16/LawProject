import crypto from "crypto";

export const ENCRYPTION_VERSION = "v1";
const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const IV_LENGTH_BYTES = 12;
const AUTH_TAG_LENGTH_BYTES = 16;
const KEY_LENGTH_BYTES = 32;
const KEY_HEX_LENGTH = 64;
const ENCRYPTED_PREFIX_REGEX = /^v[0-9]+:/;

export interface StoredMessagePayload {
  content: string;
  encryptionVersion?: string;
}

export const validateEncryptionKey = (keyHex?: string): Buffer => {
  const resolvedKey = (keyHex !== undefined ? keyHex : process.env.CHAT_ENCRYPTION_KEY || "").trim();

  if (!resolvedKey) {
    throw new Error("Application startup failed: CHAT_ENCRYPTION_KEY environment variable is required");
  }

  if (resolvedKey.length !== KEY_HEX_LENGTH || !/^[0-9a-fA-F]{64}$/.test(resolvedKey)) {
    throw new Error("Application startup failed: CHAT_ENCRYPTION_KEY must be a 64-character hexadecimal string");
  }

  const keyBuffer = Buffer.from(resolvedKey, "hex");
  if (keyBuffer.length !== KEY_LENGTH_BYTES) {
    throw new Error("Application startup failed: CHAT_ENCRYPTION_KEY must represent exactly 32 bytes");
  }

  return keyBuffer;
};

const resolveKeyBuffer = (key?: string | Buffer): Buffer => {
  if (Buffer.isBuffer(key)) {
    if (key.length !== KEY_LENGTH_BYTES) {
      throw new Error("Encryption key buffer must be exactly 32 bytes");
    }
    return key;
  }
  return validateEncryptionKey(key);
};

export const encryptMessage = (plaintext: string, key?: string | Buffer): string => {
  if (typeof plaintext !== "string") {
    throw new TypeError("Plaintext must be a string");
  }

  const keyBuffer = resolveKeyBuffer(key);
  const iv = crypto.randomBytes(IV_LENGTH_BYTES);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, keyBuffer, iv);

  let ciphertext = cipher.update(plaintext, "utf8", "hex");
  ciphertext += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return `${ENCRYPTION_VERSION}:${iv.toString("hex")}:${authTag.toString("hex")}:${ciphertext}`;
};

export const decryptMessage = (encryptedPayload: string, key?: string | Buffer): string => {
  if (typeof encryptedPayload !== "string") {
    throw new TypeError("Encrypted payload must be a string");
  }

  const parts = encryptedPayload.split(":");
  if (parts.length !== 4) {
    throw new Error("Invalid encrypted payload envelope");
  }

  const [version, ivHex, authTagHex, ciphertextHex] = parts;

  if (version !== ENCRYPTION_VERSION) {
    throw new Error(`Unsupported encryption version: ${version}`);
  }

  if (!/^[0-9a-fA-F]{24}$/.test(ivHex)) {
    throw new Error("Invalid IV in encrypted payload envelope");
  }

  if (!/^[0-9a-fA-F]{32}$/.test(authTagHex)) {
    throw new Error("Invalid authentication tag in encrypted payload envelope");
  }

  if (!/^[0-9a-fA-F]*$/.test(ciphertextHex) || ciphertextHex.length % 2 !== 0) {
    throw new Error("Invalid ciphertext in encrypted payload envelope");
  }

  const keyBuffer = resolveKeyBuffer(key);
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  try {
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, keyBuffer, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertextHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    throw new Error("Decryption failed: authentication tag mismatch or corrupted data");
  }
};

export const isEncryptedMessage = (payload: string): boolean => {
  if (typeof payload !== "string") {
    return false;
  }
  return ENCRYPTED_PREFIX_REGEX.test(payload);
};

export const resolveStoredMessage = (
  message: StoredMessagePayload,
  key?: string | Buffer
): string => {
  if (!message || typeof message.content !== "string") {
    throw new TypeError("Stored message must contain a string content property");
  }

  if (message.encryptionVersion === undefined) {
    return message.content;
  }

  if (message.encryptionVersion === ENCRYPTION_VERSION) {
    return decryptMessage(message.content, key);
  }

  throw new Error(`Invalid or unsupported encryption version: ${String(message.encryptionVersion)}`);
};
