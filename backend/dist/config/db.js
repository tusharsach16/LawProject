"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function connectDB() {
    try {
        const url = process.env.MONGODB_URL;
        if (!url)
            throw new Error("MongoDb url not defined in .env");
        await mongoose_1.default.connect(url);
        console.log("Connected to DB.");
    }
    catch (e) {
        console.log("Failed to connect to db");
        console.error(e);
        process.exit(1);
    }
}
;
exports.default = connectDB;
