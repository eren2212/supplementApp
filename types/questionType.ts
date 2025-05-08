export interface IQuestions {
  type: string;
  id: number;
  question: string;
  options: string[];
  questionNumber: number;
  answer: string;
  suggestible_supplement?: {
    option: string;
    supplement: string;
  }[];
  showOnAdminDashboard: boolean;
}
