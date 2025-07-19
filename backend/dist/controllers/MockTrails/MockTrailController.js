"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMockTrialById = exports.postMockMessage = exports.postMockJoin = exports.getSituationsCat = exports.getSituations = exports.getMockSituation = void 0;
const Category_1 = require("../../models/quiz/Category");
const MockSituation_1 = require("../../models/Mocktrial/MockSituation");
const Mock_1 = require("../../models/Mocktrial/Mock");
const mongoose_1 = __importDefault(require("mongoose"));
const redisClient_1 = require("../../utils/redisClient");
const getMockSituation = async (req, res) => {
    try {
        const id = req.query.id;
        const mockSituation = await MockSituation_1.MockTrialSituation.find({ _id: id }).select('title description');
        if (mockSituation.length === 0) {
            res.status(400).json({ msg: "Mock situation doesnot exists." });
            return;
        }
        res.status(200).json({ mockSituation });
    }
    catch (e) {
        res.status(500).json({ msg: "Something went wrong", e });
    }
};
exports.getMockSituation = getMockSituation;
const getSituations = async (req, res) => {
    try {
        const situations = await MockSituation_1.MockTrialSituation.find().select('title description');
        if (situations.length === 0) {
            res.status(400).json({ msg: "Mock situation doesnot exists." });
            return;
        }
        res.status(200).json({ situations });
    }
    catch (e) {
        res.status(500).json({ msg: "Something went wrong", e });
    }
};
exports.getSituations = getSituations;
const getSituationsCat = async (req, res) => {
    try {
        const slug = req.query.slug;
        let filter = {};
        if (slug) {
            const categoryDoc = await Category_1.Category.findOne({ slug: slug });
            if (!categoryDoc) {
                res.status(404).json({ message: "Category not found" });
                return;
            }
            filter = { categoryId: categoryDoc._id };
        }
        const situations = await MockSituation_1.MockTrialSituation.find(filter).lean();
        res.status(200).json({ situations });
    }
    catch (e) {
        res.status(500).json({ message: "Something went wrong", e });
    }
};
exports.getSituationsCat = getSituationsCat;
const postMockJoin = async (req, res) => {
    var _a, _b;
    try {
        const { situationId, side } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        if (!situationId || !side || !["plaintiff", "defendant"].includes(side)) {
            res.status(400).json({ msg: "Fields are required" });
            return;
        }
        if (!userId) {
            res.status(401).json({ msg: "Unauthenticated" });
            return;
        }
        if (role !== "lawstudent") {
            res.status(403).json({ msg: "Only law students can participate" });
            return;
        }
        const situation = await MockSituation_1.MockTrialSituation.findById(situationId);
        if (!situation) {
            res.status(404).json({ msg: "Mock trial situation not found" });
            return;
        }
        // Check user already in active trial
        const active = await Mock_1.MockTrial.findOne({
            status: "active",
            $or: [
                { plaintiffId: userId },
                { defendantId: userId }
            ]
        });
        if (active) {
            res.status(403).json({ msg: "You are already in an active trial" });
            return;
        }
        // 2️⃣  Try to find waiting opponent
        const opposite = side === "plaintiff" ? "defendant" : "plaintiff";
        const waitKey = `waiting:${situationId}:${side}`;
        const oppKey = `waiting:${situationId}:${opposite}`;
        // Pop one user from opposite list (returns null if empty)
        const opponentId = await redisClient_1.redis.lPop(oppKey);
        if (opponentId) {
            /* 🟢 Opponent found → create new trial */
            const trial = await Mock_1.MockTrial.create({
                plaintiffId: side === "plaintiff" ? userId : opponentId,
                defendantId: side === "defendant" ? userId : opponentId,
                categoryId: situation.categoryId,
                situationId: new mongoose_1.default.Types.ObjectId(situationId),
                messages: [],
                status: "active",
                startedAt: new Date()
            });
            res.status(200).json({ paired: true, trialId: trial._id });
            return;
        }
        /* 🔴 No opponent → push current user into waiting queue */
        // TTL 120s ensures auto‑cleanup
        await redisClient_1.redis.rPush(waitKey, userId);
        await redisClient_1.redis.expire(waitKey, 120);
        res.status(202).json({ waiting: true, msg: "Waiting for opponent" });
    }
    catch (e) {
        console.error("join error", e);
        res.status(500).json({ msg: "Something went wrong", error: e });
    }
};
exports.postMockJoin = postMockJoin;
const postMockMessage = async (req, res) => {
    var _a, _b, _c;
    try {
        const { trialId, text } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!trialId || !text) {
            res.status(400).json({ msg: "Fields are required" });
            return;
        }
        const trial = await Mock_1.MockTrial.findById(trialId);
        if (!trial) {
            res.status(404).json({ msg: "Trial not found" });
            return;
        }
        if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== "lawstudent") {
            res.status(403).json({ msg: "Only Law student can participate" });
            return;
        }
        if (userId !== trial.plaintiffId.toString() &&
            userId !== ((_c = trial.defendantId) === null || _c === void 0 ? void 0 : _c.toString())) {
            res.status(403).json({ msg: "Not a participant" });
            return;
        }
        const message = {
            senderId: new mongoose_1.default.Types.ObjectId(userId),
            text,
            timestamp: new Date(),
        };
        if (trial.messages.length >= 200) {
            res.status(403).json({ msg: "Trial has reached the maximum number of messages (200)" });
            return;
        }
        trial.messages.push(message);
        await trial.save();
        res.status(200).json({ msg: "Message sent", message });
    }
    catch (e) {
        res.status(500).json({ msg: "Something went wrong", error: e });
    }
};
exports.postMockMessage = postMockMessage;
const getMockTrialById = async (req, res) => {
    try {
        const { trialId } = req.params;
        if (!trialId) {
            res.status(400).json({ msg: "Trial ID is required" });
            return;
        }
        const trial = await Mock_1.MockTrial.findById(trialId)
            .populate("plaintiffId", "username")
            .populate("defendantId", "username")
            .lean();
        if (!trial) {
            res.status(404).json({ msg: "Trial not found" });
            return;
        }
        res.status(200).json({ trial });
    }
    catch (error) {
        res.status(500).json({ msg: "Something went wrong", error });
    }
};
exports.getMockTrialById = getMockTrialById;
