import { Component, inject, signal, effect, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { VoiceRecognitionService } from './voice-recognition.service';
import { FormsModule } from '@angular/forms';
import { LearningService } from './learning.service';
import { CommonModule } from '@angular/common';
import { Topic, Question, Answer, TopicResponse, QuestionResponse, AnswerResponse } from './types';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-learning',
  imports: [FormsModule, CommonModule, TranslatePipe],
  template: `
    <div class="wrap-learning">
      <div class="question">
        <details #dropdownDetails class="dropdown">
          <summary class="summary" [aria-busy]="isLoadingTopic()">
            {{ selectedTopic()?.name || ('learning.select_topic' | translate) }}
          </summary>
          <ul>
            @for (topic of topics(); track topic._id) {
            <li>
              <a href="#" (click)="selectTopic(topic); $event.preventDefault()">{{ topic.name }}</a>
            </li>
            }
          </ul>
        </details>

        <button (click)="generateQuestion()" [disabled]="!selectedTopic()">
          {{ 'learning.gen_question' | translate }}
        </button>
      </div>

      @if (selectedQuestion()) {
      <div class="question-display">
        <div>Question: {{ selectedQuestion() }}</div>
      </div>
      }

      <div class="content">
        <div class="control">
          <button (click)="startRecording()" class="btn">
            {{ 'learning.record' | translate }}
          </button>
          <button (click)="stopRecording()" class="btn">{{ 'learning.stop' | translate }}</button>
        </div>
        <textarea
          [ngModel]="message()"
          (ngModelChange)="message.set($event)"
          class="user-input"
        ></textarea>
      </div>

      <button
        (click)="getAIFeedBack()"
        [disabled]="!selectedTopic() || !selectedQuestion() || !message() || isLoading()"
        class="btn"
      >
        @if (isLoading()) {
        <span>Loading...</span>
        } @else {
        <span>{{ 'learning.view_result' | translate }}</span>
        }
      </button>

      @if (isLoading()) {
      <div class="loading">
        <p aria-busy="true">{{ 'learning.process_answer' | translate }}</p>
      </div>
      } @if (feedback() && !isLoading()) {
      <div class="result">
        <h3>{{ 'learning.result' | translate }}</h3>
        <p>
          <strong>{{ 'learning.score' | translate }}:</strong> {{ feedback()?.score }}
        </p>
        <p class="feedback">
          <strong>{{ 'learning.feedback' | translate }}:</strong> {{ feedback()?.aiFeedBack }}
        </p>
        <p class="feedback">
          <strong>{{ 'learning.sample_answer' | translate }}:</strong>
          {{ feedback()?.sampleAnswer }}
        </p>
      </div>
      }
    </div>
  `,
  styles: `
  .wrap-learning {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    text-align: center;
  }

  .question {
    display: flex;
    justify-content: center;
    align-items: center;
    gap:15px;
    flex-direction: column;
  }

  .dropdown {
    margin-bottom: 0;
  }

  .summary {
    height: 55px !important;
    border-radius: 15px !important;
    background: white !important;
    min-width: 275px;
  }

  .content {
    margin-top: 20px;
  }

  .user-input {
    background: white;
    color: black;
  }

  .control {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
    justify-content: center;
  }

  .btn {
    width: 200px;
  }

  .question-display {
    margin-top: 20px;
    padding: 15px;
    background-color: #f5f5f5;
    border-radius: 5px;
    border-left: 4px solid #8030b9ff;
    color: black;
  }

  .result {
    margin-top: 20px;
    padding: 20px;
    background-color: #e8f5e9;
    border-radius: 5px;
    margin-bottom: 40px;
  }

  .result h3 {
    margin-top: 0;
    color: #692e7dff;
    font-family: 'Montserrat';
  }

  .result p {
    margin: 10px 0;
    color: black;
  }

  .loading {
    margin-top: 20px;
    padding: 20px;
    text-align: center;
    background-color: #ab8cfbff;
    border-radius: 5px;
  }

  .loading p {
    margin: 0;
    color: white;
    font-weight: 500;
  }

  .feedback {
    text-align: left;
  }
  `,
})
export class LearningComponent implements OnDestroy {
  voiceRecognitionService = inject(VoiceRecognitionService);
  learningService = inject(LearningService);
  @ViewChild('dropdownDetails') dropdownDetails!: ElementRef<HTMLDetailsElement>;
  message = signal('');
  topics = signal<Topic[]>([]);
  selectedTopic = signal<Topic | null>(null);
  selectedQuestion = signal<string | null>(null);
  feedback = signal<Answer | null>(null);
  isLoading = signal(false);
  isLoadingTopic = signal(false);

  constructor() {
    this.voiceRecognitionService.init();
    this.loadTopics();
    effect(() => {
      const recognizedText = this.voiceRecognitionService.text();
      this.message.set(recognizedText);
    });
  }

  // Clear state when component is destroyed
  ngOnDestroy() {
    // Stop recording if running
    if (!this.voiceRecognitionService.isStoppedSpeechRecog) {
      this.voiceRecognitionService.stop();
    }
    this.voiceRecognitionService.clearText();
  }

  loadTopics() {
    this.isLoadingTopic.set(true);
    this.learningService.getTopic().subscribe({
      next: (response: TopicResponse) => {
        this.isLoadingTopic.set(false);
        if (response.success && response.data) {
          this.topics.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading topics:', error);
      },
    });
  }

  selectTopic(topic: Topic) {
    this.selectedTopic.set(topic);
    this.selectedQuestion.set(null);
    this.feedback.set(null);
    setTimeout(() => {
      if (this.dropdownDetails?.nativeElement) {
        this.dropdownDetails.nativeElement.open = false;
      }
    }, 0);
  }

  generateQuestion() {
    const topic = this.selectedTopic();
    if (!topic) return;

    // Stop recording if running
    if (!this.voiceRecognitionService.isStoppedSpeechRecog) {
      this.voiceRecognitionService.stop();
    }

    // Clear recognized text when generating new question
    this.voiceRecognitionService.clearText();
    this.message.set('');

    this.learningService.getQuestion(topic._id).subscribe({
      next: (response: QuestionResponse) => {
        if (response.success && response.data && response.data.length > 0) {
          // Randomly select one question
          const randomIndex = Math.floor(Math.random() * response.data.length);
          const randomQuestion = response.data[randomIndex];
          this.selectedQuestion.set(randomQuestion.question);
          this.feedback.set(null);
        }
      },
      error: (error) => {
        console.error('Error loading questions:', error);
      },
    });
  }

  startRecording() {
    this.voiceRecognitionService.start();
  }

  stopRecording() {
    this.voiceRecognitionService.stop();
  }

  getAIFeedBack() {
    const topic = this.selectedTopic();
    const question = this.selectedQuestion();
    const userAnswer = this.message();

    if (!topic || !question || !userAnswer) {
      return;
    }

    this.isLoading.set(true);
    this.feedback.set(null);

    const requestData = {
      topic: topic.name,
      question: question,
      userAnswer: userAnswer,
    };

    this.learningService.getFeedBack(requestData).subscribe({
      next: (response: AnswerResponse) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.feedback.set(response.data);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error getting feedback:', error);
      },
    });
  }
}
