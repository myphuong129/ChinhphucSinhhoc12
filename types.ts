
export enum QuestionType {
  ChooseOne = 'ChooseOne',
  ChooseMultiple = 'ChooseMultiple',
  ChooseMltiple = 'ChooseMltiple', // Hỗ trợ typo từ database cũ
  TrueFalse = 'True/False',
  ShortAnswer = 'ShortAnswer'
}

export interface User {
  account: string;
  name: string;
  class: string;
  email: string;
  role: string;
  progress: 'ON' | 'OFF';
  active: 'ON' | 'OFF';
}

export interface Lesson {
  stt: number;
  name: string;
  title: string;
  count: number;
  timeout: number;
  targetScore: number;
  isLocked?: boolean;
  status?: 'Pass' | 'Fail' | 'None';
}

export interface Question {
  stt: number;
  lesson_id: number;
  question_type: string; // Chuyển sang string để linh hoạt kiểm tra
  quiz_level: string;
  point: number;
  question_text: string;
  image_id: string;
  option_A: string;
  option_B: string;
  option_C: string;
  option_D: string;
  answer_key: string;
  solution: string;
}

export interface ResultRecord {
  result_id: string;
  name: string;
  role: string;
  lesson_name: string;
  grade: string;
  score: number;
  total_questions: number;
  status: 'Pass' | 'Fail';
  time_spent: string;
  answers: string; // JSON string
}

export type AppView = 'LOGIN' | 'DASHBOARD' | 'QUIZ' | 'REVIEW';
