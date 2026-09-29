import React, { useState } from 'react';
import { api } from '../services/api';
import type { LearningPathResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { Input, Select } from '../components/common/FormElements';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { AILoader } from '../components/common/LoadingStates';
import { ErrorMessage } from '../components/common/ErrorMessage';
import {
  Compass,
  Sparkles,
  Copy,
  Clock,
  Target,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Bookmark,
  ArrowRight,
  Activity,
  Layers,
} from 'lucide-react';

export const LearningPathPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [topic, setTopic] = useState('');
  const [lastSubmittedTopic, setLastSubmittedTopic] = useState('');
  const [currentLevel, setCurrentLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [studyTime, setStudyTime] = useState<string>('30 minutes/day');
  const [goal, setGoal] = useState<string>('Practical skills');

  const [result, setResult] = useState<LearningPathResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleTopics = ['SQL & Relational Databases', 'Machine Learning Basics', 'Microeconomics', 'Organic Chemistry'];

  const handleGenerate = async (overrideTopic?: string) => {
    const target = (overrideTopic || topic).trim();
    if (!target) {
      setError('Please tell EduGenie what you want to learn.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setLastSubmittedTopic(target);

    try {
      const data = await api.ai.getLearningPath({
        topic: target,
        current_level: currentLevel,
        study_time: studyTime,
        goal,
      });
      setResult(data);
      showToast('Personalized learning roadmap generated!');
    } catch (err: any) {
      setError(err?.message || 'Unable to create your learning path.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const { learning_path } = result;
    const textToCopy = `EduGenie Learning Roadmap: ${learning_path.topic}\nGoal: ${learning_path.goal} | Available Time: ${learning_path.study_time}\n\nOverview:\n${learning_path.overview}\n\nRecommended Sequence:\n${learning_path.recommended_sequence
      .map((s, i) => `${i + 1}. ${s}`)
      .join('\n')}\n\nModules:\n${learning_path.modules
      .map(
        (m) =>
          `[${m.level}] ${m.title} (${m.estimated_time})\nTopics: ${m.topics.join(', ')}\nPractice: ${m.practice_activities.join(
            ', '
          )}\nRevision: ${m.revision_recommendations}`
      )
      .join('\n\n')}\n\nNext Steps:\n${learning_path.next_steps.map((ns) => `• ${ns}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    showToast('Copied learning path to clipboard!');
  };

  const levelOptions = [
    { value: 'Beginner', label: 'Beginner (Starting from Scratch)' },
    { value: 'Intermediate', label: 'Intermediate (Know Fundamentals)' },
    { value: 'Advanced', label: 'Advanced (Deepening Mastery)' },
  ];

  const timeOptions = [
    { value: '15 minutes/day', label: '15 minutes/day (Bite-sized)' },
    { value: '30 minutes/day', label: '30 minutes/day (Consistent focus)' },
    { value: '1 hour/day', label: '1 hour/day (Accelerated track)' },
    { value: '2+ hours/day', label: '2+ hours/day (Intensive bootcamp)' },
  ];

  const goalOptions = [
    { value: 'College exam', label: 'College Exam / Semester Prep' },
    { value: 'Interview preparation', label: 'Technical Interview Preparation' },
    { value: 'Practical skills', label: 'Practical Hands-on Projects' },
    { value: 'General knowledge', label: 'General Knowledge & Curiosity' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 sm:py-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
          <Compass className="w-4 h-4" />
          <span>Curriculum & Career Roadmap</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          Personalized Learning Path
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Generate structured beginner-to-advanced learning roadmaps mapped to your daily schedule and goals.
        </p>
      </div>

      {/* Input Card */}
      <Card className="space-y-4">
        <div>
          <Input
            label="What do you want to learn?"
            placeholder="e.g. SQL, Data Structures, Macroeconomics, Molecular Biology..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isLoading}
            className="text-base"
          />
        </div>

        {/* 3 Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Current Level"
            options={levelOptions}
            value={currentLevel}
            onChange={(e) => setCurrentLevel(e.target.value as any)}
            disabled={isLoading}
          />
          <Select
            label="Available Study Time"
            options={timeOptions}
            value={studyTime}
            onChange={(e) => setStudyTime(e.target.value)}
            disabled={isLoading}
          />
          <Select
            label="Primary Goal"
            options={goalOptions}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Suggested topics */}
        <div>
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
            Popular Learning Tracks:
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleTopics.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setTopic(sample);
                  handleGenerate(sample);
                }}
                disabled={isLoading}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200/60 dark:border-slate-700/60"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-end border-t border-slate-100 dark:border-slate-800">
          <Button
            size="md"
            onClick={() => handleGenerate()}
            isLoading={isLoading}
            leftIcon={<Sparkles className="w-4 h-4" />}
            className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 text-white"
          >
            Create My Learning Path
          </Button>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <AILoader
          title="Creating your learning path..."
          subtitle="Structuring beginner, intermediate, and advanced modules calibrated to your daily available study time"
          type="path"
        />
      )}

      {/* Error Message */}
      {error && !isLoading && (
        <ErrorMessage message={error} onRetry={() => handleGenerate(lastSubmittedTopic)} />
      )}

      {/* Output Display */}
      {result && !isLoading && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <Card className="p-6 sm:p-8 space-y-6 border-emerald-200/80 dark:border-emerald-900/60 shadow-md">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    {result.learning_path.current_level} Level
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {result.learning_path.study_time}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    Goal: {result.learning_path.goal}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {result.learning_path.topic} Roadmap
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleCopy} leftIcon={<Copy className="w-3.5 h-3.5" />}>
                  Copy Path
                </Button>
                {user && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Saved</span>
                  </span>
                )}
              </div>
            </div>

            {/* Overview */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Executive Overview</span>
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {result.learning_path.overview}
              </p>
            </div>

            {/* Recommended Sequence */}
            {result.learning_path.recommended_sequence?.length > 0 && (
              <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-500" />
                  <span>Recommended Progression Sequence</span>
                </h4>
                <div className="flex flex-wrap items-center gap-2">
                  {result.learning_path.recommended_sequence.map((step, idx) => (
                    <React.Fragment key={idx}>
                      <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700">
                        {step}
                      </span>
                      {idx < result.learning_path.recommended_sequence.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* Modules: Beginner, Intermediate, Advanced */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Curriculum Modules</span>
              </h4>

              <div className="space-y-4">
                {result.learning_path.modules.map((mod, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                            mod.level === 'Beginner'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              : mod.level === 'Intermediate'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                          }`}
                        >
                          {mod.level}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {mod.title}
                        </h4>
                      </div>
                      <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {mod.estimated_time}
                      </span>
                    </div>

                    {/* Topics and Subtopics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="space-y-1">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Core Topics:</span>
                        <ul className="space-y-1 list-disc pl-4 text-slate-600 dark:text-slate-400">
                          {mod.topics.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-1">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Detailed Subtopics:</span>
                        <ul className="space-y-1 list-disc pl-4 text-slate-600 dark:text-slate-400">
                          {mod.subtopics.map((st, i) => (
                            <li key={i}>{st}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Practice Activities & Revision */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                          🛠 Practice Activities:
                        </span>
                        <ul className="space-y-0.5 text-slate-600 dark:text-slate-300">
                          {mod.practice_activities.map((pa, i) => (
                            <li key={i}>• {pa}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                        <span className="font-bold text-indigo-700 dark:text-indigo-400 block mb-1">
                          📝 Revision Recommendation:
                        </span>
                        <p className="text-slate-600 dark:text-slate-300">
                          {mod.revision_recommendations}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps / Day 1 Action Plan */}
            {result.learning_path.next_steps?.length > 0 && (
              <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Your Immediate Next Steps</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {result.learning_path.next_steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-200 font-medium"
                    >
                      {step}
                    </div>
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
