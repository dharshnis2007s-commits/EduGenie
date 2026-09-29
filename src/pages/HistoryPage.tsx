import React, { useEffect, useState, useCallback } from 'react';
import type { HistoryItem, ActiveTab } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../components/common/Toast';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorMessage } from '../components/common/ErrorMessage';
import {
  History,
  Search,
  Trash2,
  Eye,
  Copy,
  Clock,
  HelpCircle,
  Brain,
  Sparkles,
  FileText,
  Compass,
  CheckCircle2,
} from 'lucide-react';

interface HistoryPageProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ setActiveTab }) => {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [items, setItems] = useState<HistoryItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail Modal State
  const [activeItem, setActiveItem] = useState<HistoryItem | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const typeParam = selectedType === 'all' ? undefined : selectedType;
      const data = await api.history.list(typeParam, searchQuery);
      setItems(data);
    } catch (err: any) {
      setError(err?.message || 'Could not load your history.');
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedType, searchQuery]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id: string, type: string) => {
    if (!window.confirm('Are you sure you want to delete this study record?')) return;
    try {
      await api.history.delete(id, type);
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (activeItem?.id === id) setActiveItem(null);
      showToast('Record deleted.');
    } catch (err: any) {
      showToast('Failed to delete item.', 'error');
    }
  };

  const handleCopyDetail = () => {
    if (!activeItem) return;
    navigator.clipboard.writeText(JSON.stringify(activeItem.fullData, null, 2));
    showToast('Copied full record details to clipboard!');
  };

  if (!user) {
    return (
      <div className="py-12 max-w-xl mx-auto">
        <EmptyState
          icon={<History className="w-8 h-8" />}
          title="Personal Learning History"
          description="Sign in or create an account to view and search all your saved Q&As, quizzes, explanations, and learning paths."
          actionText="Log In / Sign Up"
          onAction={() => openAuthModal('login')}
        />
      </div>
    );
  }

  const tabs = [
    { id: 'all', label: 'All History', icon: <History className="w-3.5 h-3.5" /> },
    { id: 'qa', label: 'Q&A', icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { id: 'explain', label: 'Explanations', icon: <Brain className="w-3.5 h-3.5" /> },
    { id: 'quiz', label: 'Quizzes', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'summarize', label: 'Summaries', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'learning_path', label: 'Learning Paths', icon: <Compass className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
            <History className="w-4 h-4" />
            <span>Saved Academic Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Study History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, search, review, and manage your past AI tutor sessions and quizzes.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search your history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = selectedType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchHistory} />}

      {/* History Items List */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
          Loading learning history...
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<History className="w-6 h-6" />}
          title="No history records found"
          description={
            searchQuery
              ? `No records match "${searchQuery}". Try a different keyword.`
              : 'You have not saved any activity in this category yet. Start learning today!'
          }
          actionText="Go to AI Tutor"
          onAction={() => setActiveTab('tutor')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="p-5 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {item.typeLabel}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(item.created_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                  {item.title}
                </h3>

                {item.badge && (
                  <span className="inline-block text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    {item.badge}
                  </span>
                )}

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {item.preview}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveItem(item)}
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                >
                  View Details
                </Button>

                <button
                  onClick={() => handleDelete(item.id, item.type)}
                  className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                  title="Delete record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Item Detail Modal */}
      <Modal
        isOpen={!!activeItem}
        onClose={() => setActiveItem(null)}
        title={activeItem ? `${activeItem.typeLabel}: ${activeItem.title}` : ''}
        maxWidth="xl"
      >
        {activeItem && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span>Saved on {new Date(activeItem.created_at).toLocaleString()}</span>
              <Button size="sm" variant="outline" onClick={handleCopyDetail} leftIcon={<Copy className="w-3.5 h-3.5" />}>
                Copy Record
              </Button>
            </div>

            {/* Q&A Render */}
            {activeItem.type === 'qa' && (
              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Question:</h4>
                  <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {activeItem.fullData?.question}
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Answer:</h4>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {activeItem.fullData?.answer}
                  </p>
                </div>
                {activeItem.fullData?.key_points?.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Key Points:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                      {activeItem.fullData.key_points.map((kp: string, i: number) => (
                        <li key={i}>{kp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Explanation Render */}
            {activeItem.type === 'explain' && (
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-950 dark:text-blue-200 font-medium">
                  {activeItem.fullData?.definition}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Explanation:</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activeItem.fullData?.simple_explanation}
                  </p>
                </div>
                {activeItem.fullData?.example && (
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Example:</h4>
                    <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {activeItem.fullData.example}
                    </p>
                  </div>
                )}
                {activeItem.fullData?.quick_revision && (
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Quick Revision:</h4>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                      {activeItem.fullData.quick_revision}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Quiz Render */}
            {activeItem.type === 'quiz' && (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-2">
                  <span>Questions in this quiz:</span>
                  <span>Score: {activeItem.fullData?.score !== null ? `${activeItem.fullData?.score}%` : 'Incomplete'}</span>
                </div>
                {activeItem.fullData?.questions?.map((q: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {i + 1}. {q.question}
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Correct Answer: {q.correctAnswer}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">
                      {q.explanation}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summarize Render */}
            {activeItem.type === 'summarize' && (
              <div className="space-y-3 text-xs sm:text-sm">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Summary:</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activeItem.fullData?.summary}
                  </p>
                </div>
                {activeItem.fullData?.key_points?.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Key Points:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                      {activeItem.fullData.key_points.map((kp: string, i: number) => (
                        <li key={i}>{kp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Learning Path Render */}
            {activeItem.type === 'learning_path' && (
              <div className="space-y-3 text-xs sm:text-sm">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Overview:</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activeItem.fullData?.overview}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">Modules:</h4>
                  {activeItem.fullData?.modules?.map((m: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        [{m.level}] {m.title}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">
                        Topics: {m.topics?.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
