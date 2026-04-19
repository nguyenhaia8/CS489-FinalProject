import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HistoryResponse } from '../learning/types';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  #http = inject(HttpClient);

  getHistory() {
    return this.#http.get<HistoryResponse>(environment.backend_URL + '/api/answer/history');
  }

  constructor() {}
}
