import { InferSchemaType, model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    username: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    role: { type: String, enum: ["Admin", "User"], default: "User" },
    refresh_token: { type: String },
    expiresAt: { type: Date },
    theme: { type: String, enum: ["light", "dark"], default: "light" },
    language: { type: String, enum: ["en", "vi"], default: "en" },
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof userSchema>;
export const UserModel = model<User>("user", userSchema);
