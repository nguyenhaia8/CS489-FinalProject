import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { TopicResponse, QuestionResponse } from '../learning/types';

@Injectable({
  providedIn: 'root'
})
export class ManageService {
  #http = inject(HttpClient);

  getTopic() {
    return this.#http.get<TopicResponse>(environment.backend_URL + '/api/topic');
  }

  getQuestion(topicId: string) {
    return this.#http.get<QuestionResponse>(environment.backend_URL + `/api/question/${topicId}`);
  }

  createTopic(data: { title: string; description: string }) {
    return this.#http.post(environment.backend_URL + '/api/topic', data);
  }

  updateTopic(topicId: string, data: { title: string; description: string }) {
    return this.#http.put(environment.backend_URL + `/api/topic/${topicId}`, data);
  }

  createQuestion(data: { topicId: string; question: string }) {
    return this.#http.post(environment.backend_URL + '/api/question', data);
  }

  updateQuestion(questionId: string, data: { question: string }) {
    return this.#http.put(environment.backend_URL + `/api/question/${questionId}`, data);
  }

  deleteTopic(topicId: string) {
    return this.#http.delete(environment.backend_URL + `/api/topic/${topicId}`);
  }

  deleteQuestion(questionId: string) {
    return this.#http.delete(environment.backend_URL + `/api/question/${questionId}`);
  }

  constructor() { }
}
