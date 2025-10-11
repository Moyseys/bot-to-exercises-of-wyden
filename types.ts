export interface PracticeResponse {
  data: Practice;
  timestamp: number;
  status: string;
  statusCode: number;
}

export interface Practice {
  id: string;
  startedAt: string;
  endedAt: string;
  tenant: string;
  disciplineCode: string;
  theme: Theme;
  questions: Question[];
}

export interface Theme {
  name: string;
  code: string;
}

export interface Question {
  id: string;
  description: string;
  alternatives: Alternative[];
  isMarkedForReview: boolean;
  selectedAnswer: string;
}

export interface Alternative {
  id: string;
  description: string;
}
