import OpenAI from "openai";
import { ENV } from "../config/env";

const openai = new OpenAI({
  apiKey: ENV.OPENAI_API_KEY,
});

export interface AnswerEvaluation {
  score: number;
  sampleAnswer: string;
  feedback: string;
}

export interface EvaluateAnswerParams {
  topic: string;
  question: string;
  userAnswer: string;
}

export const evaluateAnswer = async (
  params: EvaluateAnswerParams
): Promise<AnswerEvaluation> => {
  const { topic, question, userAnswer } = params;

  const systemPrompt = `You are an expert educator and evaluator. Your task is to evaluate student answers and provide constructive feedback.`;

  const userPrompt = `Please evaluate the following answer and provide detailed feedback.
  
  Topic: ${topic}
  Question: ${question}
  Student's Answer: ${userAnswer}

  Please provide your evaluation in the following JSON format:
  {
    "score": <number from 0 to 100>,
    "sampleAnswer": "A comprehensive sample answer that demonstrates best practices",
    "feedback": "Overall feedback and comments about the answer"
  }

  Requirements:
  1. Score should be based on: accuracy, completeness, clarity, and relevance to the topic
  2. Sample answer should be well-structured, comprehensive, and demonstrate best practices
  3. Feedback should be constructive and encouraging

  Return ONLY valid JSON, no additional text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error("No response from OpenAI");
    }

    const evaluation = JSON.parse(responseContent) as AnswerEvaluation;

    if (
      typeof evaluation.score !== "number" ||
      typeof evaluation.sampleAnswer !== "string" ||
      typeof evaluation.feedback !== "string"
    ) {
      throw new Error("Invalid response format from OpenAI");
    }

    evaluation.score = Math.max(0, Math.min(100, Math.round(evaluation.score)));

    return evaluation;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    throw new Error("Unknown error occurred while calling OpenAI API");
  }
};
