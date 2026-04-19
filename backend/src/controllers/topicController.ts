import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { TopicModel } from "../models/topicModel";
import { AuthRequest } from "../middleware/auth";

export const createTopic = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;

    const newTopic = await TopicModel.create({
      name: title,
      description,
    });

    res.status(201).json({
      success: true,
      data: {
        topicId: newTopic._id,
        title: newTopic.name,
        description: newTopic.description,
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

export const getAllTopic = async (req: AuthRequest, res: Response) => {
  try {
    const allTopic = await TopicModel.find({});

    if (allTopic.length == 0) {
      res.json({ success: false, data: [] });
    } else {
      res.json({ success: true, data: allTopic });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Something went wrong" });
    }
  }
};

export const updateTopic = async (req: AuthRequest, res: Response) => {
  try {
    const { topic_id } = req.params;
    const { title, description } = req.body;
    const result = await TopicModel.updateOne(
      { _id: topic_id },
      {
        name: title,
        description: description,
      }
    );

    if (result.modifiedCount === 0) {
      res.json({ success: false, data: {} });
    } else {
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

export const deleteTopic = async (req: AuthRequest, res: Response) => {
  try {
    const { topic_id } = req.params;

    const result = await TopicModel.deleteOne({ _id: topic_id });

    if (result.deletedCount === 0) {
      res.json({ success: false, data: {} });
    } else {
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
