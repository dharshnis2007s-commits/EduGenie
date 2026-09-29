import React, { useEffect, useState, useCallback } from 'react';
import type { ActiveTab, DashboardStats, RecentActivity } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorMessage } from '../components/common/ErrorMessage';
import {
  HelpCircle,
  Brain,
  Sparkles,
  FileText,
  Compass,
  Trophy,
  ArrowRight,
  Clock,
  PlusCircle,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';

interface DashboardPageProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setActiveTab }) => {
  const { user, openAuthModal } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.dashboard.getStats();
      setStats(res.stats);
      setActivities(res.recentActivity);
    } catch (err: any) {
      setError(err?.message || 'Could not load your dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (!user) {
    return (
      <div className="py-12 max-w-xl mx-auto">
        <EmptyState
          icon={<GraduationCap className="w-8 h-8" />}
          title="Student Dashboard"
          description="Log in or create an account to view your educational metrics, test scores, saved explanations, and learning history."
          actionText="Log In / Sign Up"
          onAction={() => openAuthModal('login')}
        />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Questions Asked',
      value: stats?.questionsAsked ?? 0,
      icon: <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      bg: 'bg-blue-50 dark:bg-blue-950/60',
    },
    {
      title: 'Explanations Generated',
      value: stats?.explanationsGenerated ?? 0,
      icon: <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      bg: 'bg-indigo-50 dark:bg-indigo-950/60',
    },
    {
      title: 'Quizzes Completed',
      value: stats?.quizzesCompleted ?? 0,
      icon: <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
      bg: 'bg-amber-50 dark:bg-amber-950/60',
    },
    {
      title: 'Average Quiz Score',
      value: stats?.averageQuizScore !== null && stats?.averageQuizScore !== undefined ? `${stats.averageQuizScore}%` : 'N/A',
      icon: <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      title: 'Summaries Created',
      value: stats?.summariesCreated ?? 0,
      icon: <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      bg: 'bg-purple-50 dark:bg-purple-950/60',
    },
    {
      title: 'Learning Paths Created',
      value: stats?.learningPathsCreated ?? 0,
      icon: <Compass className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
      bg: 'bg-cyan-50 dark:bg-cyan-950/60',
    },
  ];

  const quickActions = [
    { label: 'Ask AI', icon: <HelpCircle className="w-4 h-4" />, tab: 'tutor' as ActiveTab },
    { label: 'Explain Concept', icon: <Brain className="w-4 h-4" />, tab: 'explain' as ActiveTab },
    { label: 'Generate Quiz', icon: <Sparkles className="w-4 h-4" />, tab: 'quiz' as ActiveTab },
    { label: 'Summarize', icon: <FileText className="w-4 h-4" />, tab: 'summarize' as ActiveTab },
    { label: 'Create Learning Path', icon: <Compass className="w-4 h-4" />, tab: 'path' as ActiveTab },
  ];

  const totalActivities =
    (stats?.questionsAsked ?? 0) +
    (stats?.explanationsGenerated ?? 0) +
    (stats?.quizzesCompleted ?? 0) +
    (stats?.summariesCreated ?? 0) +
    (stats?.learningPathsCreated ?? 0);

  return (
    <div className="space-y-8 py-4 sm:py-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white/20 uppercase tracking-wider text-blue-100">
            {user.education_level || 'Student'} Edition
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Welcome back, {user.full_name}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-lg">
            Ready to learn something new today? Choose a tool below or continue where you left off.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="bg-white text-blue-700 hover:bg-blue-50 border-transparent shadow-xs"
          onClick={() => setActiveTab('tutor')}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          New Study Session
        </Button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchDashboardData} />}

      {/* Quick Action Buttons */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((qa) => (
            <button
              key={qa.label}
              onClick={() => setActiveTab(qa.tab)}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-xs hover:shadow-sm transition-all text-left cursor-pointer group"
            >
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                {qa.icon}
              </div>
              <span>{qa.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Study Analytics
          </h3>
          <span className="text-[11px] text-slate-400">Real-time statistics</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {statCards.map((c) => (
            <Card key={c.title} className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 line-clamp-1">
                  {c.title}
                </span>
                <div className={`p-1.5 rounded-lg ${c.bg}`}>
                  {c.icon}
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                {isLoading ? '...' : c.value}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity & Learning Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Section */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Recent Activity</span>
            </h3>
            {activities.length > 0 && (
              <button
                onClick={() => setActiveTab('history')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>View all history</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {activities.length === 0 ? (
            <EmptyState
              icon={<Clock className="w-6 h-6" />}
              title="No learning activity yet"
              description="Ask your first question and start learning with EduGenie."
              actionText="Ask EduGenie"
              onAction={() => setActiveTab('tutor')}
            />
          ) : (
            <Card className="divide-y divide-slate-100 dark:divide-slate-800 p-0 overflow-hidden">
              {activities.map((act) => (
                <div key={act.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {act.title}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(act.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono uppercase">
                    {act.activity_type}
                  </span>
                </div>
              ))}
            </Card>
          )}
        </div>

        {/* Learning Progress Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Learning Progress</span>
          </h3>

          <Card className="p-5 space-y-4">
            {totalActivities === 0 ? (
              <div className="text-center py-4 space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Complete questions and quizzes to view your mastery retention progress.
                </p>
                <Button size="sm" variant="secondary" onClick={() => setActiveTab('quiz')}>
                  Take a Quiz
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-400">Quiz Mastery</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {stats?.averageQuizScore ? `${stats.averageQuizScore}%` : 'Pending'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${stats?.averageQuizScore || 20}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Total Interactions:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{totalActivities} items</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Academic Level:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{user.education_level}</span>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
