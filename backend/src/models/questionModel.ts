import { InferSchemaType, model, Schema } from "mongoose";

const questionSchema = new Schema(
  {
    topicId: { type: Schema.Types.ObjectId, require: true },
    question: { type: String, require: true },
  },
  { timestamps: true }
);

export type Question = InferSchemaType<typeof questionSchema>;
export const QuestionModel = model<Question>("question", questionSchema);
