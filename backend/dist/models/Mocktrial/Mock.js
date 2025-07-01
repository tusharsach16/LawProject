"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockTrial = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const messageSchema = new mongoose_1.Schema({
    senderId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});
const mockTrialSchema = new mongoose_1.Schema({
    plaintiffId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    defendantId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    categoryId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Category", required: true }, // 🟢 NEW
    messages: { type: [messageSchema], default: [] },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    winnerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    status: {
        type: String,
        enum: ["active", "ended", "left"],
        default: "active"
    }
}, { timestamps: true });
const MockTrial = mongoose_1.default.model("MockTrial", mockTrialSchema);
exports.MockTrial = MockTrial;
