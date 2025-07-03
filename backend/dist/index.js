"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const db_1 = __importDefault(require("./config/db"));
const path_1 = __importDefault(require("path"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const QuizRoutes_1 = __importDefault(require("./routes/QuizRoutes"));
const MockTrailRoute_1 = __importDefault(require("./routes/MockTrailRoute"));
const FriendRequest_1 = __importDefault(require("./routes/FriendRequest"));
const envPath = path_1.default.resolve(__dirname, "../.env");
console.log("🔍 Looking for .env at:", envPath);
dotenv_1.default.config({ path: envPath });
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(express_1.default.json());
// ✅ Optional debug check
console.log("✅ Loaded Mongo URL:", ((_a = process.env.MONGODB_URL) === null || _a === void 0 ? void 0 : _a.slice(0, 25)) + "...");
app.use('/api', authRoutes_1.default);
app.use('/quiz', QuizRoutes_1.default);
app.use('/mockTrail', MockTrailRoute_1.default);
app.use('/apiFriend', FriendRequest_1.default);
(0, db_1.default)();
app.listen(PORT, () => {
    console.log(`✅ Server running on PORT: ${PORT}`);
});
