import { Response } from "express";
import { QuestionModel } from "../models/questionModel";
import { AuthRequest } from "../middleware/auth";

export const createQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { topicId, question } = req.body;

    const newQuestion = await QuestionModel.create({
      topicId: topicId,
      question,
    });

    res.status(201).json({
      success: true,
      data: {
        questionId: newQuestion._id,
        topicId: newQuestion.topicId,
        question: newQuestion.question,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Something went wrong" });
    }
  }
};

export const getQuestionsByTopicId = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { topicId } = req.params;

    const questions = await QuestionModel.find({
      topicId: topicId,
    });

    res.json({
      success: true,
      data: questions,
      count: questions.length,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Something went wrong" });
    }
  }
};

export const updateQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { questionId } = req.params;
    const { question } = req.body;

    if (!questionId || !question) {
      return res.status(400).json({
        success: false,
        message: "QuestionId and question are required",
      });
    }

    const updatedQuestion = await QuestionModel.findByIdAndUpdate(
      questionId,
      { question },
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.json({
      success: true,
      data: updatedQuestion,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Something went wrong" });
    }
  }
};

export const deleteQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { questionId } = req.params;

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "QuestionId is required",
      });
    }

    const deletedQuestion = await QuestionModel.findByIdAndDelete(questionId);

    if (!deletedQuestion) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.json({
      success: true,
      message: "Question deleted successfully",
      data: {
        questionId: deletedQuestion._id,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Something went wrong" });
    }
  }
};
