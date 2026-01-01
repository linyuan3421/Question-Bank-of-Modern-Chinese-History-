export enum QuestionType {
  Single = 'single',
  Multiple = 'multiple'
}

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options: string[]; // Array of strings like "A. Option content"
  answer: string[]; // Array of correct keys ["A"] or ["A", "B"]
  explanation?: string;
}

export interface Chapter {
  id: string;
  title: string;
  questions: Question[];
}

export interface UserProgress {
  [questionId: string]: boolean; // true if answered correctly
}

export interface WrongAnswers {
  [questionId: string]: boolean; // true if currently in wrong list
}

export type AppMode = 'home' | 'quiz' | 'review';