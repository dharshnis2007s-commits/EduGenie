export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  education_level: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  education_level: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface QAResult {
  id?: string | null;
  answer: string;
  key_points: string[];
  follow_ups: string[];
  saved?: boolean;
}

export interface ExplanationResult {
  id?: string | null;
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  style: 'Simple' | 'Detailed' | 'Example-based' | 'Exam-oriented';
  explanation: {
    definition: string;
    simple_explanation: string;
    step_by_step: string[];
    example: string;
    important_points: string[];
    quick_revision: string;
    model_provider?: string;
  };
  saved?: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizResult {
  id?: string | null;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question_count: number;
  questions: QuizQuestion[];
  saved?: boolean;
}

export interface SummaryResult {
  id?: string | null;
  summary: string;
  key_points: string[];
  important_terms: Array<{ term: string; definition: string }>;
  quick_revision: string;
  saved?: boolean;
}

export interface LearningModule {
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  title: string;
  estimated_time: string;
  topics: string[];
  subtopics: string[];
  practice_activities: string[];
  revision_recommendations: string;
}

export interface LearningPathResult {
  id?: string | null;
  learning_path: {
    topic: string;
    goal: string;
    current_level: string;
    study_time: string;
    overview: string;
    recommended_sequence: string[];
    modules: LearningModule[];
    next_steps: string[];
  };
  saved?: boolean;
}

export interface HistoryItem {
  id: string;
  type: 'qa' | 'explain' | 'quiz' | 'summarize' | 'learning_path';
  typeLabel: string;
  title: string;
  badge?: string;
  preview: string;
  fullData: any;
  created_at: string;
}

export interface DashboardStats {
  questionsAsked: number;
  explanationsGenerated: number;
  quizzesCompleted: number;
  averageQuizScore: number | null;
  summariesCreated: number;
  learningPathsCreated: number;
}

export interface RecentActivity {
  id: string;
  activity_type: string;
  title: string;
  metadata: any;
  created_at: string;
}

export type ActiveTab = 'home' | 'tutor' | 'explain' | 'quiz' | 'summarize' | 'path' | 'dashboard' | 'history' | 'profile';
