import { Injectable, signal } from '@angular/core';

interface SpeechRecognitionEvent {
  results: Array<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
}

interface SpeechRecognition {
  interimResults: boolean;
  lang: string;
  continuous: boolean;
  start(): void;
  stop(): void;
  addEventListener(type: string, listener: (event: SpeechRecognitionEvent | Event) => void): void;
  removeEventListener(type: string, listener: (event: SpeechRecognitionEvent | Event) => void): void;
}

declare var webkitSpeechRecognition: {
  new (): SpeechRecognition;
};

@Injectable({
  providedIn: 'root',
})
export class VoiceRecognitionService {
  recognition = new webkitSpeechRecognition();
  isStoppedSpeechRecog = false;
  tempWords: string = '';
  text = signal('');
  private endHandler: ((event: SpeechRecognitionEvent | Event) => void) | null = null;
  private resultHandler: ((event: SpeechRecognitionEvent | Event) => void) | null = null;
  private finalText: string = '';
  private lastProcessedIndex: number = -1;

  constructor() {
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.continuous = true;
    this.resultHandler = this.handleResult.bind(this);
  }

  init() {
    if (this.resultHandler) {
      this.recognition.removeEventListener('result', this.resultHandler);
    }
    if (this.resultHandler) {
      this.recognition.addEventListener('result', this.resultHandler);
    }
  }

  private handleResult(event: SpeechRecognitionEvent | Event) {
    if (!('results' in event)) return;
    
    let interimTranscript = '';
    let newFinalTranscript = '';

    for (let i = this.lastProcessedIndex + 1; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        newFinalTranscript += transcript + ' ';
        this.lastProcessedIndex = i;
      } else {
        interimTranscript += transcript;
      }
    }

    if (newFinalTranscript) {
      this.finalText += newFinalTranscript;
      this.tempWords = '';
    }

    this.tempWords = interimTranscript;
    this.text.set((this.finalText + this.tempWords).trim());
  }

  start() {
    this.isStoppedSpeechRecog = false;
    this.lastProcessedIndex = -1;

    if (this.endHandler) {
      this.recognition.removeEventListener('end', this.endHandler);
    }

    this.recognition.start();

    this.endHandler = () => {
      if (this.isStoppedSpeechRecog) {
        this.recognition.stop();
        this.wordConcat();
      } else {
        this.wordConcat();
        this.recognition.start();
      }
    };

    this.recognition.addEventListener('end', this.endHandler);
  }

  stop() {
    this.isStoppedSpeechRecog = true;
    this.wordConcat();
    this.recognition.stop();

    if (this.endHandler) {
      this.recognition.removeEventListener('end', this.endHandler);
      this.endHandler = null;
    }
  }

  wordConcat() {
    if (this.tempWords) {
      this.finalText += this.tempWords + ' ';
      this.tempWords = '';
      this.text.set(this.finalText.trim());
    }
  }

  clearText() {
    this.text.set('');
    this.tempWords = '';
    this.finalText = '';
    this.lastProcessedIndex = -1;

    if (!this.isStoppedSpeechRecog) {
      this.stop();
    }
  }
}
