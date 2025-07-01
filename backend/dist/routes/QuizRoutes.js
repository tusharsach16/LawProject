"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const quizController_1 = require("../controllers/quizController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = express_1.default.Router();
router.get('/getQuiz', authMiddleware_1.default, quizController_1.getQuizQues);
router.post('/submit', authMiddleware_1.default, quizController_1.submitAttempt);
router.get('/getResult', authMiddleware_1.default, quizController_1.result);
exports.default = router;
