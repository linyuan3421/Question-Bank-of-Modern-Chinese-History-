import { UserProgress, WrongAnswers } from '../types';

const PROGRESS_KEY = 'history_quiz_progress';
const WRONG_KEY = 'history_quiz_wrong';

export const saveProgress = (questionId: string, isCorrect: boolean) => {
  const currentProgress: UserProgress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
  currentProgress[questionId] = isCorrect;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(currentProgress));
};

export const getProgress = (): UserProgress => {
  return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
};

export const saveWrongAnswer = (questionId: string) => {
  const currentWrong: WrongAnswers = JSON.parse(localStorage.getItem(WRONG_KEY) || '{}');
  currentWrong[questionId] = true;
  localStorage.setItem(WRONG_KEY, JSON.stringify(currentWrong));
};

export const removeWrongAnswer = (questionId: string) => {
  const currentWrong: WrongAnswers = JSON.parse(localStorage.getItem(WRONG_KEY) || '{}');
  delete currentWrong[questionId];
  localStorage.setItem(WRONG_KEY, JSON.stringify(currentWrong));
};

export const getWrongAnswers = (): WrongAnswers => {
  return JSON.parse(localStorage.getItem(WRONG_KEY) || '{}');
};

export const resetAllData = () => {
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(WRONG_KEY);
    window.location.reload();
}