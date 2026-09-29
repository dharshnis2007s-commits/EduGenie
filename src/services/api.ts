import type {
  User,
  Profile,
  QAResult,
  ExplanationResult,
  QuizResult,
  SummaryResult,
  LearningPathResult,
  HistoryItem,
  DashboardStats,
  RecentActivity,
} from '../types';

const TOKEN_KEY = 'edugenie_token';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { message: string } | null;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const resJson: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    data: null,
    error: { message: `Network or server error (${response.status})` },
  }));

  if (!resJson.success || resJson.error) {
    throw new Error(resJson.error?.message || 'An unexpected error occurred.');
  }

  return resJson.data as T;
}

export const api = {
  // Auth
  auth: {
    register: async (payload: { email: string; password: string; full_name: string; education_level?: string }) => {
      const data = await request<{ token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setToken(data.token);
      return data.user;
    },
    login: async (payload: { email: string; password: string }) => {
      const data = await request<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setToken(data.token);
      return data.user;
    },
    logout: async () => {
      try {
        await request('/api/auth/logout', { method: 'POST' });
      } finally {
        removeToken();
      }
    },
    getMe: async () => {
      const data = await request<{ user: User }>('/api/auth/me');
      return data.user;
    },
    forgotPassword: async (email: string) => {
      return request<{ message: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
    resetPassword: async (new_password: string) => {
      return request<{ message: string }>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ new_password }),
      });
    },
  },

  // Profile
  profile: {
    get: async () => {
      const data = await request<{ profile: Profile }>('/api/profile');
      return data.profile;
    },
    update: async (payload: { full_name: string; education_level: string; avatar_url?: string }) => {
      const data = await request<{ profile: Profile }>('/api/profile', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return data.profile;
    },
  },

  // Dashboard
  dashboard: {
    getStats: async () => {
      return request<{ stats: DashboardStats; recentActivity: RecentActivity[] }>('/api/dashboard/stats');
    },
  },

  // AI Modules
  ai: {
    askQA: async (question: string) => {
      return request<QAResult>('/api/qa', {
        method: 'POST',
        body: JSON.stringify({ question }),
      });
    },
    explainConcept: async (payload: {
      concept: string;
      difficulty: string;
      style: string;
      provider?: 'gemini' | 'lamini-fallback';
    }) => {
      return request<ExplanationResult>('/api/explain', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    generateQuiz: async (payload: {
      topic: string;
      question_count: number;
      difficulty: string;
    }) => {
      return request<QuizResult>('/api/quiz', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    saveQuizResult: async (quizId: string, score: number) => {
      return request<{ message: string }>('/api/quiz/save-result', {
        method: 'POST',
        body: JSON.stringify({ quizId, score, completed: true }),
      });
    },
    summarize: async (payload: {
      text: string;
      length: string;
      style: string;
    }) => {
      return request<SummaryResult>('/api/summarize', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    getLearningPath: async (payload: {
      topic: string;
      current_level: string;
      study_time: string;
      goal: string;
    }) => {
      return request<LearningPathResult>('/api/learn/recommendations', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },

  // History
  history: {
    list: async (type?: string, search?: string) => {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (search) params.append('search', search);
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const data = await request<{ items: HistoryItem[] }>(`/api/history${queryStr}`);
      return data.items;
    },
    delete: async (id: string, type?: string) => {
      const queryStr = type ? `?type=${type}` : '';
      return request<{ message: string }>(`/api/history/${id}${queryStr}`, {
        method: 'DELETE',
      });
    },
  },
};
