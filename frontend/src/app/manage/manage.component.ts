import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManageService } from './manage.service';
import { Topic, Question, TopicResponse, QuestionResponse } from '../learning/types';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-manage',
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="manage-container">
      <h2>{{ 'manage.title' | translate }}</h2>

      <!-- Add topic -->
      <div class="add-topic-section">
        <button (click)="showAddTopicForm.set(!showAddTopicForm())" class="btn">
          {{
            showAddTopicForm() ? ('manage.cancel' | translate) : ('manage.add_topic' | translate)
          }}
        </button>

        @if (showAddTopicForm()) {
        <div class="form-container">
          <h3>
            {{
              editingTopic()
                ? ('manage.edit_topic' | translate)
                : ('manage.add_new_topic' | translate)
            }}
          </h3>
          <form (ngSubmit)="saveTopic()">
            <div class="form-group">
              <label>{{ 'manage.topic' | translate }}:</label>
              <input
                type="text"
                [(ngModel)]="topicForm.title"
                name="title"
                required
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>{{ 'manage.description' | translate }}:</label>
              <input
                type="text"
                [(ngModel)]="topicForm.description"
                name="description"
                class="form-control"
              />
            </div>
            <div class="form-actions">
              <button type="submit" class="btn">{{ 'manage.save' | translate }}</button>
              <button type="button" (click)="cancelTopicForm()" class="btn">
                {{ 'manage.cancel' | translate }}
              </button>
            </div>
          </form>
        </div>
        }
      </div>

      <!-- Topics list -->
      @if(isLoadingTopic()) {
      <p aria-busy="true" class="is-loading">Loading topics...</p>
      } @else {

      <div class="topics-list">
        @for (topic of topics(); track topic._id) {
        <div class="topic-card">
          <div class="topic-header">
            <div class="topic-info">
              <h3>{{ topic.name }}</h3>
              @if (topic.description) {
              <p class="description">{{ topic.description }}</p>
              }
            </div>
            <div class="topic-actions">
              <button (click)="editTopic(topic)" class="btn btn-sm btn-edit">
                {{ 'manage.edit' | translate }}
              </button>
              <button (click)="deleteTopic(topic._id)" class="btn btn-sm btn-danger">
                {{ 'manage.delete' | translate }}
              </button>
            </div>
          </div>

          <!-- Questions for this topic -->
          <div class="questions-section">
            <div class="questions-header">
              <h4>{{ 'manage.question' | translate }}</h4>
              <button (click)="showAddQuestionForm(topic._id)" class="btn btn-sm">
                {{ 'manage.add_question' | translate }}
              </button>
            </div>

            <!-- Add question form -->
            @if (addingQuestionForTopic() === topic._id) {
            <div class="form-container">
              <h3>
                {{
                  editingQuestion()
                    ? ('manage.edit_question' | translate)
                    : ('manage.add_new_question' | translate)
                }}
              </h3>
              <form (ngSubmit)="saveQuestion(topic._id)">
                <div class="form-group">
                  <label>{{ 'manage.question' | translate }}:</label>
                  <textarea
                    [(ngModel)]="questionForm.question"
                    name="question"
                    required
                    class="form-control"
                    rows="3"
                  ></textarea>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn">{{ 'manage.save' | translate }}</button>
                  <button type="button" (click)="cancelQuestionForm()" class="btn">
                    {{ 'manage.cancel' | translate }}
                  </button>
                </div>
              </form>
            </div>
            }

            <!-- Questions list -->
            @if(isLoadingQuestion()) {
            <p aria-busy="true" class="is-loading2">Loading question...</p>
            }
            <div class="questions-list">
              @if (questionsByTopic()[topic._id]) { @for (question of questionsByTopic()[topic._id];
              track question._id) {
              <div class="question-item">
                <p>{{ question.question }}</p>
                <div class="question-actions">
                  <button (click)="editQuestion(question, topic._id)" class="btn btn-sm btn-edit">
                    {{ 'manage.edit' | translate }}
                  </button>
                  <button
                    (click)="deleteQuestion(question._id, topic._id)"
                    class="btn btn-sm btn-danger"
                  >
                    {{ 'manage.delete' | translate }}
                  </button>
                </div>
              </div>
              } } @else {
              <p class="no-questions">No questions yet</p>
              }
            </div>
          </div>
        </div>
        }
      </div>
      }
    </div>
  `,
  styles: `
    .manage-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    h2 {
      margin-bottom: 30px;
      color: white;
      font-family: 'Montserrat';
    }

    .add-topic-section {
      margin-bottom: 30px;
    }

    .form-container {
      margin-top: 20px;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 8px;
      border: 1px solid #ddd;
      margin-bottom: 20px;
    }

    .form-container h3 {
      margin-top: 0;
      font-size: 24px;
      color: #007bff;
      margin-bottom: 8px;
      font-family: 'Montserrat';
    }

    .form-group {
      margin-bottom: 10px;
    }

    .form-group label {
      margin-bottom: 5px;
      font-size: 16px;
    }

    .form-control {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
      height: 40px;
      margin-bottom: 0;
      background: white;
      color: black;
    }

    textarea.form-control {
      resize: vertical;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }

    .topics-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .topic-card {
      background-color: #fff;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .topic-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #f0f0f0;
    }

    .topic-info h3 {
      margin: 0 0 5px 0;
      color: #007bff;
      font-family: 'Montserrat';
    }

    .topic-info .description {
      margin: 0;
      color: #666;
      font-style: italic;
      font-size: 16px;
    }

    .questions-section {
      margin-top: 20px;
    }

    .questions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .questions-header h4 {
      margin: 0;
      color: #333;
      font-family: 'Montserrat';
    }

    .questions-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .question-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      font-size: 16px;
      background-color: #f9f9f9;
      border-radius: 5px;
      border-left: 3px solid #6429d4ff;
    }

    .question-item p {
      margin: 0;
      flex: 1;
      color: #333;
    }

    .no-questions {
      color: #999;
      font-style: italic;
      padding: 20px;
      text-align: center;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 18px;
      transition: all 0.3s;
    }

    .btn-edit {
      background: #28a745;
      min-width: 65px;
      color: white;
    }

    .btn-danger {
      background: #dc3545;
      min-width: 65px;
      color: white;
    }

    .btn-sm {
      padding: 5px 10px;
      font-size: 12px;
      border-radius: 8px;
    }

    .topic-actions {
      display: flex;
      gap: 10px;
    }

    .question-actions {
      display: flex;
      gap: 10px;
    }

    .is-loading {
      color: white;
      text-align: center;
    }

    .is-loading2 {
      color: black;
      text-align: center;
    }
  `,
})
export class ManageComponent {
  manageService = inject(ManageService);
  topics = signal<Topic[]>([]);
  questionsByTopic = signal<Record<string, Question[]>>({});
  showAddTopicForm = signal(false);
  addingQuestionForTopic = signal<string | null>(null);
  editingTopic = signal<Topic | null>(null);
  editingQuestion = signal<Question | null>(null);
  isLoadingTopic = signal(false);
  isLoadingQuestion = signal(false);

  topicForm = {
    title: '',
    description: '',
  };

  questionForm = {
    question: '',
  };

  constructor() {
    this.loadTopics();
  }

  loadTopics() {
    this.isLoadingTopic.set(true);
    this.manageService.getTopic().subscribe({
      next: (response: TopicResponse) => {
        this.isLoadingTopic.set(false);
        if (response.success && response.data) {
          this.topics.set(response.data);
          // Load questions for each topic
          response.data.forEach((topic) => {
            this.loadQuestions(topic._id);
          });
        }
      },
      error: (error) => {
        console.error('Error loading topics:', error);
      },
    });
  }

  loadQuestions(topicId: string) {
    this.isLoadingQuestion.set(true);
    this.manageService.getQuestion(topicId).subscribe({
      next: (response: QuestionResponse) => {
        this.isLoadingQuestion.set(false);
        if (response.success && response.data) {
          const current = this.questionsByTopic();
          this.questionsByTopic.set({
            ...current,
            [topicId]: response.data,
          });
        }
      },
      error: (error) => {
        console.error('Error loading questions:', error);
      },
    });
  }

  saveTopic() {
    const topic = this.editingTopic();
    if (topic) {
      // Update topic
      this.manageService
        .updateTopic(topic._id, {
          title: this.topicForm.title,
          description: this.topicForm.description,
        })
        .subscribe({
          next: () => {
            this.loadTopics();
            this.cancelTopicForm();
          },
          error: (error) => {
            console.error('Error updating topic:', error);
          },
        });
    } else {
      // Create topic
      this.manageService
        .createTopic({
          title: this.topicForm.title,
          description: this.topicForm.description,
        })
        .subscribe({
          next: () => {
            this.loadTopics();
            this.cancelTopicForm();
          },
          error: (error) => {
            console.error('Error creating topic:', error);
          },
        });
    }
  }

  editTopic(topic: Topic) {
    this.editingTopic.set(topic);
    this.topicForm.title = topic.name;
    this.topicForm.description = topic.description || '';
    this.showAddTopicForm.set(true);
  }

  cancelTopicForm() {
    this.showAddTopicForm.set(false);
    this.editingTopic.set(null);
    this.topicForm.title = '';
    this.topicForm.description = '';
  }

  showAddQuestionForm(topicId: string) {
    if (this.addingQuestionForTopic() === topicId) {
      this.cancelQuestionForm();
    } else {
      this.addingQuestionForTopic.set(topicId);
      this.editingQuestion.set(null);
      this.questionForm.question = '';
    }
  }

  saveQuestion(topicId: string) {
    const question = this.editingQuestion();
    if (question) {
      // Update question
      this.manageService
        .updateQuestion(question._id, {
          question: this.questionForm.question,
        })
        .subscribe({
          next: () => {
            this.loadQuestions(topicId);
            this.cancelQuestionForm();
          },
          error: (error) => {
            console.error('Error updating question:', error);
          },
        });
    } else {
      // Create question
      this.manageService
        .createQuestion({
          topicId: topicId,
          question: this.questionForm.question,
        })
        .subscribe({
          next: () => {
            this.loadQuestions(topicId);
            this.cancelQuestionForm();
          },
          error: (error) => {
            console.error('Error creating question:', error);
          },
        });
    }
  }

  editQuestion(question: Question, topicId: string) {
    this.editingQuestion.set(question);
    this.questionForm.question = question.question;
    this.addingQuestionForTopic.set(topicId);
  }

  cancelQuestionForm() {
    this.addingQuestionForTopic.set(null);
    this.editingQuestion.set(null);
    this.questionForm.question = '';
  }

  deleteTopic(topicId: string) {
    if (
      confirm(
        'Are you sure you want to delete this topic? This will also delete all questions in this topic.'
      )
    ) {
      this.manageService.deleteTopic(topicId).subscribe({
        next: () => {
          this.loadTopics();
        },
        error: (error) => {
          console.error('Error deleting topic:', error);
        },
      });
    }
  }

  deleteQuestion(questionId: string, topicId: string) {
    if (confirm('Are you sure you want to delete this question?')) {
      this.manageService.deleteQuestion(questionId).subscribe({
        next: () => {
          this.loadQuestions(topicId);
        },
        error: (error) => {
          console.error('Error deleting question:', error);
        },
      });
    }
  }
}
