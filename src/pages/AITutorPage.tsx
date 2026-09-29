import React, { useState } from 'react';
import { api } from '../services/api';
import type { QAResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { TextArea } from '../components/common/FormElements';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { AILoader } from '../components/common/LoadingStates';
import { ErrorMessage } from '../components/common/ErrorMessage';
import {
  HelpCircle,
  Sparkles,
  Copy,
  RotateCcw,
  Trash2,
  Bookmark,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export const AITutorPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [question, setQuestion] = useState('');
  const [lastSubmittedQuestion, setLastSubmittedQuestion] = useState('');
  const [result, setResult] = useState<QAResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleQuestions = [
    'Which is the largest ocean?',
    'Why do leaves change color in autumn?',
    "Explain Newton's third law of motion with a sports example",
    'How does photosynthesis convert sunlight into glucose?',
  ];

  const handleAsk = async (queryToAsk?: string) => {
    const q = (queryToAsk || question).trim();
    if (!q) {
      setError('Please type an educational question before asking.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setLastSubmittedQuestion(q);

    try {
      const data = await api.ai.askQA(q);
      setResult(data);
      if (data.saved) {
        showToast('Answer generated and saved to your history!');
      } else {
        showToast('Answer generated!');
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to generate response from EduGenie AI Tutor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `Question: ${lastSubmittedQuestion}\n\nAnswer: ${result.answer}\n\nKey Points:\n${result.key_points
      .map((kp) => `• ${kp}`)
      .join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    showToast('Copied answer to clipboard!');
  };

  const handleClear = () => {
    setQuestion('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>Interactive Educational Q&A</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            EduGenie AI Tutor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ask any academic question and receive concise, structured answers with key takeaways.
          </p>
        </div>

        {!user && (
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between gap-2">
            <span>Sign in to save your Q&A history</span>
            <Button size="sm" variant="outline" onClick={() => openAuthModal('login')}>
              Sign In
            </Button>
          </div>
        )}
      </div>

      {/* Input Card */}
      <Card className="space-y-4">
        <div>
          <TextArea
            label="Your Educational Question"
            placeholder="Ask anything about your studies... (e.g. Which is the largest ocean?)"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
            className="min-h-[120px] text-base"
          />
        </div>

        {/* Sample Question Chips */}
        <div>
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Suggested Questions:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setQuestion(sample);
                  handleAsk(sample);
                }}
                disabled={isLoading}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200/60 dark:border-slate-700/60 text-left"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={isLoading || (!question && !result)}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Clear
          </Button>

          <Button
            size="md"
            onClick={() => handleAsk()}
            isLoading={isLoading}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Ask EduGenie
          </Button>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <AILoader
          title="EduGenie is thinking..."
          subtitle="Formulating a clear academic explanation with key points using Google Gemini"
          type="general"
        />
      )}

      {/* Error Message */}
      {error && !isLoading && (
        <ErrorMessage message={error} onRetry={() => handleAsk(lastSubmittedQuestion)} />
      )}

      {/* Result Display */}
      {result && !isLoading && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <Card className="p-6 space-y-6 border-blue-200/80 dark:border-blue-900/60 shadow-md">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  🧞‍♂️
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    EduGenie Tutor Response
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Question: "{lastSubmittedQuestion}"
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  leftIcon={<Copy className="w-3.5 h-3.5" />}
                >
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAsk(lastSubmittedQuestion)}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Regenerate
                </Button>
                {user && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Saved</span>
                  </span>
                )}
              </div>
            </div>

            {/* Direct Answer */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Direct Answer & Explanation</span>
              </h4>
              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-line">
                {result.answer}
              </p>
            </div>

            {/* Key Points */}
            {result.key_points && result.key_points.length > 0 && (
              <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Key Takeaways</span>
                </h4>
                <ul className="space-y-2">
                  {result.key_points.map((pt, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Follow-up Questions */}
            {result.follow_ups && result.follow_ups.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Explore Further / Follow-up Questions</span>
                </h4>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                  {result.follow_ups.map((fu, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuestion(fu);
                        handleAsk(fu);
                      }}
                      className="text-xs text-left px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-between gap-2"
                    >
                      <span>{fu}</span>
                      <ArrowRight className="w-3 h-3 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
