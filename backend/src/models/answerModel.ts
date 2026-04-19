import { InferSchemaType, model, Schema } from "mongoose";

const answerSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, require: true },
    topic: { type: String },
    question: { type: String },
    originalText: { type: String, require: true },
    aiFeedBack: { type: String, require: true },
    sampleAnswer: { type: String, require: true },
    score: Number,
  },
  { timestamps: true }
);

export type Answer = InferSchemaType<typeof answerSchema>;
export const AnswerModel = model<Answer>("answer", answerSchema);
