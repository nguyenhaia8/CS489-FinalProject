import { InferSchemaType, model, Schema } from "mongoose";

const topicSchema = new Schema(
  {
    name: { type: String, require: true, unique: true },
    description: { type: String },
  },
  { timestamps: true }
);

export type Topic = InferSchemaType<typeof topicSchema>;
export const TopicModel = model<Topic>("topic", topicSchema);
