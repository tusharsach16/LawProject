"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const MockTrailController_1 = require("../controllers/MockTrails/MockTrailController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = express_1.default.Router();
router.get('/situation/', authMiddleware_1.default, MockTrailController_1.getMockSituation);
router.get('/situations', authMiddleware_1.default, MockTrailController_1.getSituations);
router.get('/situationsCategory', authMiddleware_1.default, MockTrailController_1.getSituationsCat);
router.post('/mockJoin', authMiddleware_1.default, MockTrailController_1.postMockJoin);
router.post('/messages', authMiddleware_1.default, MockTrailController_1.postMockMessage);
router.get('/:trailId', MockTrailController_1.getMockTrialById);
exports.default = router;
