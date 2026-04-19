import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { AnswerEvaluation, evaluateAnswer } from "../services/openaiService";
import { AnswerModel } from "../models/answerModel";

export const generateAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const { topic, question, userAnswer } = req.body;
    const user = req.user;
    const params = {
      topic,
      question,
      userAnswer,
    };

    const evaluate: AnswerEvaluation = await evaluateAnswer(params);

    const result = await AnswerModel.create({
      score: evaluate.score,
      topic: topic,
      question: question,
      userId: user?._id,
      originalText: userAnswer,
      aiFeedBack: evaluate.feedback,
      sampleAnswer: evaluate.sampleAnswer,
    });

    if (result) {
      res.json({ success: true, data: result });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Something went wrong" });
    }
  }
};

export const getHistoryAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    const result = await AnswerModel.find({
      userId: user?._id,
    });

    if (result) {
      res.json({ success: true, data: result });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Something went wrong" });
    }
  }
};
