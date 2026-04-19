import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { LearningRequest, TopicResponse, QuestionResponse, AnswerResponse } from './types';

@Injectable({
  providedIn: 'root',
})
export class LearningService {
  #http = inject(HttpClient);

  getTopic() {
    return this.#http.get<TopicResponse>(environment.backend_URL + '/api/topic');
  }

  getQuestion(topicId: string) {
    return this.#http.get<QuestionResponse>(environment.backend_URL + `/api/question/${topicId}`);
  }

  getFeedBack(userData: LearningRequest) {
    return this.#http.post<AnswerResponse>(environment.backend_URL + '/api/answer', userData);
  }
}
