"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSituationsCat = exports.getSituations = exports.getMockSituation = void 0;
const Category_1 = require("../models/quiz/Category");
const MockSituation_1 = require("../models/Mocktrial/MockSituation");
const getMockSituation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.query.id;
        const mockSituation = yield MockSituation_1.MockTrialSituation.find({ _id: id }).select('title description');
        if (mockSituation.length === 0) {
            res.status(400).json({ msg: "Mock situation doesnot exists." });
            return;
        }
        res.status(200).json({ mockSituation });
    }
    catch (e) {
        res.status(500).json({ msg: "Something went wrong", e });
    }
});
exports.getMockSituation = getMockSituation;
const getSituations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const situations = yield MockSituation_1.MockTrialSituation.find().select('title description');
        if (situations.length === 0) {
            res.status(400).json({ msg: "Mock situation doesnot exists." });
            return;
        }
        res.status(200).json({ situations });
    }
    catch (e) {
        res.status(500).json({ msg: "Something went wrong", e });
    }
});
exports.getSituations = getSituations;
const getSituationsCat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = req.query.slug;
        let filter = {};
        if (slug) {
            const categoryDoc = yield Category_1.Category.findOne({ slug: slug });
            if (!categoryDoc) {
                res.status(404).json({ message: "Category not found" });
                return;
            }
            filter = { categoryId: categoryDoc._id };
        }
        const situations = yield MockSituation_1.MockTrialSituation.find(filter).lean();
        res.status(200).json({ situations });
    }
    catch (e) {
        res.status(500).json({ message: "Something went wrong", e });
    }
});
exports.getSituationsCat = getSituationsCat;
