import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db";
import { ChatHistory } from "../models/ChatHistory";
import {
  encryptMessage,
  validateEncryptionKey,
  ENCRYPTION_VERSION
} from "../utils/cryptoUtils";

export interface MigrationResult {
  scannedDocuments: number;
  migratedMessages: number;
  skippedDocuments: number;
  failedRecords: number;
  isDryRun: boolean;
}

export interface MigrationOptions {
  dryRun?: boolean;
  batchSize?: number;
  encryptionKey?: string | Buffer;
}

export const runChatMigration = async (
  options: MigrationOptions = {}
): Promise<MigrationResult> => {
  const isDryRun = Boolean(options.dryRun);
  const batchSize = options.batchSize || 100;
  const key = options.encryptionKey;

  if (key) {
    if (typeof key === "string") {
      validateEncryptionKey(key);
    }
  } else {
    validateEncryptionKey();
  }

  let scannedDocuments = 0;
  let migratedMessages = 0;
  let skippedDocuments = 0;
  let failedRecords = 0;

  const cursor = ChatHistory.find({}).cursor({ batchSize });

  const inspectDocumentMessages = (
    messages: any[]
  ): {
    unencryptedIndices: number[];
    hasMalformedMessages: boolean;
    hasUnsupportedVersions: boolean;
  } => {
    const unencryptedIndices: number[] = [];
    let hasMalformedMessages = false;
    let hasUnsupportedVersions = false;

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      if (!message || typeof message.content !== "string") {
        hasMalformedMessages = true;
        continue;
      }

      if (message.encryptionVersion === undefined) {
        unencryptedIndices.push(i);
        continue;
      }

      if (message.encryptionVersion === ENCRYPTION_VERSION) {
        continue;
      }

      if (message.encryptionVersion === null || message.encryptionVersion === "") {
        hasMalformedMessages = true;
        continue;
      }

      hasUnsupportedVersions = true;
    }

    return { unencryptedIndices, hasMalformedMessages, hasUnsupportedVersions };
  };

  for await (const doc of cursor) {
    scannedDocuments++;

    if (!doc.messages || !Array.isArray(doc.messages) || doc.messages.length === 0) {
      skippedDocuments++;
      continue;
    }

    const initialInspection = inspectDocumentMessages(doc.messages);

    if (initialInspection.hasMalformedMessages || initialInspection.hasUnsupportedVersions) {
      failedRecords++;
      continue;
    }

    if (initialInspection.unencryptedIndices.length === 0) {
      skippedDocuments++;
      continue;
    }

    if (isDryRun) {
      migratedMessages += initialInspection.unencryptedIndices.length;
      continue;
    }

    let updateSuccess = false;
    let attempts = 0;
    let currentDoc = doc;

    while (!updateSuccess && attempts < 3) {
      attempts++;
      const currentInspection = inspectDocumentMessages(currentDoc.messages);
      const currentIndices = currentInspection.unencryptedIndices;

      if (currentInspection.hasUnsupportedVersions || currentInspection.hasMalformedMessages) {
        break;
      }

      if (currentIndices.length === 0) {
        skippedDocuments++;
        updateSuccess = true;
        break;
      }

      const queryCondition: Record<string, any> = {
        _id: currentDoc._id,
        updatedAt: currentDoc.updatedAt
      };

      const updateFields: Record<string, any> = {};
      let encryptionFailed = false;

      for (const index of currentIndices) {
        const message = currentDoc.messages[index];
        queryCondition[`messages.${index}.content`] = message.content;
        try {
          updateFields[`messages.${index}.content`] = encryptMessage(message.content, key);
          updateFields[`messages.${index}.encryptionVersion`] = ENCRYPTION_VERSION;
        } catch {
          encryptionFailed = true;
          break;
        }
      }

      if (encryptionFailed) {
        break;
      }

      if (currentDoc.historyVersion === undefined || currentDoc.historyVersion === null) {
        updateFields.historyVersion = 1;
      }

      const updateResult = await ChatHistory.updateOne(queryCondition, {
        $set: updateFields
      });

      if (updateResult.matchedCount === 1) {
        migratedMessages += currentIndices.length;
        updateSuccess = true;
      } else {
        const freshDoc = await ChatHistory.findById(currentDoc._id);
        if (!freshDoc || !Array.isArray(freshDoc.messages)) {
          break;
        }
        currentDoc = freshDoc;
      }
    }

    if (!updateSuccess) {
      failedRecords++;
    }
  }

  return {
    scannedDocuments,
    migratedMessages,
    skippedDocuments,
    failedRecords,
    isDryRun
  };
};

if (require.main === module) {
  const executeMigration = async () => {
    const envPath = path.resolve(__dirname, "../../.env");
    dotenv.config({ path: envPath });

    const isDryRunArg = process.argv.includes("--dry-run");
    await connectDB();

    try {
      const result = await runChatMigration({ dryRun: isDryRunArg });
      console.log(`Dry run mode: ${result.isDryRun}`);
      console.log(`Scanned documents: ${result.scannedDocuments}`);
      console.log(`Migrated messages: ${result.migratedMessages}`);
      console.log(`Skipped documents: ${result.skippedDocuments}`);
      console.log(`Failed records: ${result.failedRecords}`);

      if (result.failedRecords > 0) {
        console.error("Chat encryption migration finished with unresolved failures.");
        process.exitCode = 1;
      } else {
        console.log("Chat encryption migration completed successfully.");
      }
    } finally {
      await mongoose.disconnect();
    }
  };

  executeMigration().catch((error) => {
    console.error("Migration execution failed:", error.message);
    process.exit(1);
  });
}
