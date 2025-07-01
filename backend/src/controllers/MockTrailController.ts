import {Request, Response} from "express";
import { Category } from "../models/quiz/Category";
import { MockTrialSituation } from "../models/Mocktrial/MockSituation";
import mongoose from "mongoose";

export const getMockSituation = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.query.id as string;
    const mockSituation = await MockTrialSituation.find({_id: id}).select('title description');
    if(mockSituation.length === 0) {
      res.status(400).json({msg: "Mock situation doesnot exists."});
      return;
    }
    res.status(200).json({mockSituation});
  } catch(e) {
    res.status(500).json({msg: "Something went wrong", e});
  }
}

export const getSituations = async (req: Request, res:Response): Promise<void> => {
  try {
    const situations = await MockTrialSituation.find().select('title description');
    if(situations.length === 0) {
      res.status(400).json({msg: "Mock situation doesnot exists."});
      return;
    }
    res.status(200).json({situations});
  } catch(e) {
    res.status(500).json({msg: "Something went wrong", e});
  }
}

export const getSituationsCat = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.query.slug as string;

    let filter = {};
    if (slug) {
      const categoryDoc = await Category.findOne({ slug: slug });
      if (!categoryDoc) {
        res.status(404).json({ message: "Category not found" });
        return;
      }
      filter = { categoryId: categoryDoc._id };
    }

    const situations = await MockTrialSituation.find(filter).lean();
    res.status(200).json({ situations });

  } catch (e) {
     res.status(500).json({ message: "Something went wrong", e });
  }
};
