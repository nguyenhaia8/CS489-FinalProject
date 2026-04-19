import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryService } from './history.service';
import { Answer, HistoryResponse } from '../learning/types';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-history',
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="history-container">
      <h2>{{ 'history.title' | translate }}</h2>

      @if (isLoading()) {
      <div class="loading">
        <p aria-busy="true" class="is-loading">Loading history...</p>
      </div>
      } @else if (history().length === 0) {
      <div class="empty-state">
        <p class="no-history">No learning history found.</p>
      </div>
      } @else {
      <div class="history-list">
        @for (item of history(); track item._id) {
        <div class="history-item">
          <div class="history-header">
            <h3>{{ item.topic }}</h3>
            <span class="score">{{ 'history.score' | translate }}: {{ item.score }}</span>
          </div>
          <div class="history-content">
            <div class="question-section">
              <strong>{{ 'history.question' | translate }}:</strong>
              <p>{{ item.question }}</p>
            </div>
            <div class="answer-section">
              <strong>{{ 'history.your_answer' | translate }}:</strong>
              <p>{{ item.originalText }}</p>
            </div>
            <div class="feedback-section">
              <strong>{{ 'history.feedback' | translate }}:</strong>
              <p>{{ item.aiFeedBack }}</p>
            </div>
          </div>
        </div>
        }
      </div>
      }
    </div>
  `,
  styles: `
    .history-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    h2 {
      margin-bottom: 30px;
      color: white;
      font-family: 'Montserrat';
    }

    .loading, .empty-state {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .no-history {
      color: white;
    }


    .is-loading {
      color: white;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .history-item {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #ddd;
    }

    .history-header h3 {
      margin: 0;
      color: #007bff;
      font-size: 22px;
      font-family: 'Montserrat';
    }

    .score {
      background-color: #71c865ff;
      color: white;
      padding: 5px 15px;
      border-radius: 15px;
      font-weight: bold;
    }

    .history-content {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .question-section,
    .answer-section,
    .feedback-section {
      padding: 10px;
      background-color: white;
      border-radius: 5px;
    }

    .question-section strong,
    .answer-section strong,
    .feedback-section strong {
      margin-bottom: 8px;
      font-size: 16px;
      text-transform: uppercase;
    }

    .question-section p,
    .answer-section p,
    .feedback-section p {
      margin: 0;
      font-size: 16px;
      font-style: italic;
      color: black;
    }

    .feedback-section {
      background-color: #e9e8f5ff;
      border-left: 3px solid #6429d4ff;
    }
  `,
})
export class HistoryComponent {
  historyService = inject(HistoryService);
  history = signal<Answer[]>([]);
  isLoading = signal(false);

  constructor() {
    this.loadHistory();
  }

  loadHistory() {
    this.isLoading.set(true);
    this.historyService.getHistory().subscribe({
      next: (response: HistoryResponse) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.history.set(response.data);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error loading history:', error);
      },
    });
  }
}
