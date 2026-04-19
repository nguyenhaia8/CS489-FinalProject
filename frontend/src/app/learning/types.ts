export interface LearningRequest {
  topic: string;
  question: string;
  userAnswer: string;
}

export interface Topic {
  _id: string;
  name: string;
  description?: string;
}

export interface Question {
  _id: string;
  topicId: string;
  question: string;
}

export interface Answer {
  _id: string;
  userId: string;
  topic: string;
  question: string;
  originalText: string;
  aiFeedBack: string;
  sampleAnswer: string;
  score: number;
}

export interface TopicResponse {
  success: boolean;
  data: Topic[];
}

export interface QuestionResponse {
  success: boolean;
  data: Question[];
  count: number;
}

export interface AnswerResponse {
  success: boolean;
  data: Answer;
}

export interface HistoryResponse {
  success: boolean;
  data: Answer[];
}
