import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/userModel";
import { ENV } from "../config/env";
import {
  TIME_EXPRIRE_ACCESS_TOKEN,
  TIME_EXPRIRE_REFRESH_TOKEN,
} from "../config/constant";
import { AuthRequest } from "../middleware/auth";

export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({
      username,
      email,
      password: hashPassword,
    });

    res.status(201).json({
      success: true,
      data: {
        userId: newUser._id,
        username: newUser.username,
        email: newUser.email,
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

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // check valid password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password as string
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // prepare token
    const accessToken = jwt.sign(
      { id: user._id.toString(), email: user.email },
      ENV.JWT_SECRET as string,
      { expiresIn: TIME_EXPRIRE_ACCESS_TOKEN }
    );

    const refreshToken = jwt.sign(
      { id: user._id, email: user.email },
      ENV.JWT_REFRESH_SECRET as string,
      { expiresIn: TIME_EXPRIRE_REFRESH_TOKEN }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 2);

    const updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      {
        refresh_token: refreshToken,
        expiresAt: expiresAt,
      },
      { new: true, projection: { password: 0 } }
    );

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          userId: updatedUser?._id,
          username: updatedUser?.username,
          email: updatedUser?.email,
          role: updatedUser?.role,
          theme: updatedUser?.theme,
          language: updatedUser?.language,
        },
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

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token is required" });
    }

    const decoded = jwt.verify(refreshToken, ENV.JWT_REFRESH_SECRET) as {
      id: string;
      email: string;
    };

    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 2);

    const accessToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      ENV.JWT_SECRET as string,
      { expiresIn: TIME_EXPRIRE_ACCESS_TOKEN }
    );

    const newRefreshToken = jwt.sign(
      {
        id: decoded.id,
        email: decoded.email,
      },
      ENV.JWT_REFRESH_SECRET as string,
      { expiresIn: TIME_EXPRIRE_REFRESH_TOKEN }
    );

    const updatedUser = await UserModel.findOneAndUpdate(
      {
        _id: decoded.id,
        refresh_token: refreshToken,
        expiresAt: { $gte: new Date() },
      },
      {
        refresh_token: newRefreshToken,
        expiresAt: newExpiresAt,
      },
      { new: true, projection: { password: 0, refresh_token: 0, expiresAt: 0 } }
    );

    if (!updatedUser) {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error: unknown) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "An error occurred" });
    }
  }
};

export const verifyAccount = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.json({
        success: true,
        message: "You can use this email to sign up",
      });
    } else {
      return res.json({ success: false, message: "Email already exists" });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Something went wrong" });
    }
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { theme, language } = req.body;
    const user = req.user;

    const updateUser = await UserModel.findByIdAndUpdate(
      { _id: user?._id },
      {
        theme: theme,
        language: language,
      }
    );

    if (updateUser) {
      res.json({ success: true, message: "Update profile successfully" });
    } else {
      res.json({ success: false, message: "Update profile failed" });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Something went wrong" });
    }
  }
};
