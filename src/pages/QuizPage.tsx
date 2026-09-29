import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import type { QuizResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { TextArea, Select } from '../components/common/FormElements';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { AILoader } from '../components/common/LoadingStates';
import { ErrorMessage } from '../components/common/ErrorMessage';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trophy,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Award,
} from 'lucide-react';

export const QuizPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [topicInput, setTopicInput] = useState('');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  const [quiz, setQuiz] = useState<QuizResult | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleTopics = [
    'Pythagoras Theorem',
    'Cell Biology and Mitosis',
    'World War II Key Milestones',
    'Basic Principles of Microeconomics',
  ];

  const handleGenerate = async (overrideTopic?: string) => {
    const target = (overrideTopic || topicInput).trim();
    if (!target) {
      setError('Please provide a topic or educational passage for the quiz.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setIsSubmitted(false);
    setSelectedAnswers({});
    setCurrentIndex(0);

    try {
      const data = await api.ai.generateQuiz({
        topic: target,
        question_count: questionCount,
        difficulty,
      });
      setQuiz(data);
      showToast(`Quiz generated with ${data.questions.length} questions!`);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate quiz. Please try again or rephrase your topic.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (option: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: option,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    // Calculate score
    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      const chosen = selectedAnswers[idx];
      if (chosen && chosen.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        correctCount++;
      }
    });

    const calculatedPercentage = Math.round((correctCount / quiz.questions.length) * 100);
    setScore(correctCount);
    setPercentage(calculatedPercentage);
    setIsSubmitted(true);

    // Confetti celebration if 70% or more
    if (calculatedPercentage >= 70) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }

    // Save score to database if quiz has an ID
    if (quiz.id) {
      try {
        await api.ai.saveQuizResult(quiz.id, calculatedPercentage);
        showToast(`Quiz completed! Score ${calculatedPercentage}% recorded.`);
      } catch (err) {
        console.warn('Could not save score:', err);
      }
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentIndex(0);
    setScore(0);
    setPercentage(0);
  };

  const currentQ = quiz?.questions[currentIndex];
  const allAnswered = quiz ? quiz.questions.every((_, idx) => selectedAnswers[idx]) : false;

  const countOptions = [
    { value: '3', label: '3 Questions (Quick Knowledge Check)' },
    { value: '5', label: '5 Questions (Standard Quiz)' },
    { value: '10', label: '10 Questions (Comprehensive Test)' },
  ];

  const diffOptions = [
    { value: 'Easy', label: 'Easy (Fundamental Recall)' },
    { value: 'Medium', label: 'Medium (Application & Reasoning)' },
    { value: 'Hard', label: 'Hard (Complex Problem-Solving)' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4 sm:py-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Interactive Assessment</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          AI Quiz Generator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Test your understanding with AI-generated multiple-choice questions complete with instant feedback and explanations.
        </p>
      </div>

      {/* Generator Configuration (when not taking a quiz or if wanting to create a new one) */}
      {(!quiz || isSubmitted) && (
        <Card className="space-y-4">
          <TextArea
            label="Quiz Topic or Study Passage"
            placeholder="e.g. Pythagoras Theorem, or paste a textbook paragraph..."
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            disabled={isLoading}
            className="min-h-[100px]"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Number of Questions"
              options={countOptions}
              value={String(questionCount)}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              disabled={isLoading}
            />
            <Select
              label="Difficulty Level"
              options={diffOptions}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              disabled={isLoading}
            />
          </div>

          {/* Quick topic buttons */}
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
              Sample Topics:
            </div>
            <div className="flex flex-wrap gap-2">
              {sampleTopics.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setTopicInput(sample);
                    handleGenerate(sample);
                  }}
                  disabled={isLoading}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/60 hover:text-amber-600 dark:hover:text-amber-400 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200/60 dark:border-slate-700/60"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              size="md"
              onClick={() => handleGenerate()}
              isLoading={isLoading}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Generate Quiz
            </Button>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <AILoader
          title="Generating your quiz..."
          subtitle="Formulating multiple-choice questions, verifying 4 options per question, and writing detailed explanations"
          type="quiz"
        />
      )}

      {/* Error Message */}
      {error && !isLoading && (
        <ErrorMessage message={error} onRetry={() => handleGenerate()} />
      )}

      {/* Active Quiz Taking Interface (One Question at a Time) */}
      {quiz && !isSubmitted && currentQ && (
        <Card className="p-6 sm:p-8 space-y-6 shadow-md border-amber-200/80 dark:border-amber-900/60">
          {/* Progress Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>
                Question {currentIndex + 1} of {quiz.questions.length}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                {quiz.difficulty}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="py-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {currentQ.question}
            </h3>
          </div>

          {/* 4 Selectable Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = selectedAnswers[currentIndex] === option;
              const optionLetter = ['A', 'B', 'C', 'D'][optIdx] || `${optIdx + 1}`;

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/60 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {optionLetter}
                  </div>
                  <span className="text-sm font-medium leading-relaxed">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Previous
            </Button>

            {currentIndex < quiz.questions.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next Question
              </Button>
            ) : (
              <Button
                size="md"
                onClick={handleSubmitQuiz}
                disabled={!allAnswered}
                leftIcon={<Award className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 text-white"
              >
                Submit Quiz
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Quiz Results and Review Interface */}
      {quiz && isSubmitted && (
        <div className="space-y-6 animate-in zoom-in-95 duration-300">
          {/* Score Header Card */}
          <Card className="p-6 sm:p-8 text-center space-y-4 border-amber-200 dark:border-amber-900/60 shadow-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-500 shadow-md">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Quiz Results: {quiz.topic}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {score} / {quiz.questions.length}
              </h2>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {percentage}% Score
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              {percentage >= 80
                ? 'Outstanding performance! You have mastered the core concepts of this topic.'
                : percentage >= 50
                ? 'Good effort! Review the detailed explanations below to reinforce key points.'
                : 'Keep practicing! Review each explanation carefully and retake the quiz when ready.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button size="sm" variant="outline" onClick={handleRetake} leftIcon={<RotateCcw className="w-4 h-4" />}>
                Retake Quiz
              </Button>
              <Button size="sm" onClick={() => setQuiz(null)} leftIcon={<Sparkles className="w-4 h-4" />}>
                Generate Another Quiz
              </Button>
            </div>
          </Card>

          {/* Detailed Question Review */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Review Answers & Explanations</span>
            </h3>

            {quiz.questions.map((q, idx) => {
              const userChoice = selectedAnswers[idx];
              const isCorrect = userChoice?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase();

              return (
                <Card
                  key={idx}
                  className={`p-5 space-y-4 border ${
                    isCorrect
                      ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20'
                      : 'border-red-200 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {q.question}
                      </h4>
                    </div>

                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Correct</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 shrink-0">
                        <XCircle className="w-4 h-4" />
                        <span>Incorrect</span>
                      </span>
                    )}
                  </div>

                  {/* Options feedback */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, optIdx) => {
                      const isUserOption = userChoice === opt;
                      const isCorrectOption = opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

                      let style = 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
                      if (isCorrectOption) {
                        style = 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 font-semibold';
                      } else if (isUserOption && !isCorrect) {
                        style = 'bg-red-50 dark:bg-red-950/80 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700';
                      }

                      return (
                        <div key={optIdx} className={`p-2.5 rounded-xl border flex items-center gap-2 ${style}`}>
                          <span className="font-mono text-[10px] uppercase font-bold text-slate-400">
                            {['A', 'B', 'C', 'D'][optIdx]}:
                          </span>
                          <span className="truncate">{opt}</span>
                          {isCorrectOption && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />}
                          {isUserOption && !isCorrect && <XCircle className="w-3.5 h-3.5 text-red-600 ml-auto shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation box */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-slate-200">Explanation: </span>
                    {q.explanation}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
