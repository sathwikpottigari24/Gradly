
export enum ViewType {
  DASHBOARD = 'DASHBOARD',
  TUTOR = 'TUTOR',
  UPDATES = 'UPDATES',
  MINDMAP = 'MINDMAP',
  NOTES = 'NOTES',
  QUIZ = 'QUIZ',
  DOUBT = 'DOUBT',
  PROFILE = 'PROFILE',
  IMAGE_ANALYSIS = 'IMAGE_ANALYSIS'
}

export interface ExamUpdate {
  name: string;
  date: string;
  deadline: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface MindMapData {
  nodes: { 
    id: string; 
    label: string; 
    group: number;
    details?: string; 
  }[];
  links: { source: string; target: string }[];
}
