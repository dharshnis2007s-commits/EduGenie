import React, { useState } from 'react';
import { api } from '../services/api';
import type { ExplanationResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { Input, Select } from '../components/common/FormElements';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { AILoader } from '../components/common/LoadingStates';
import { ErrorMessage } from '../components/common/ErrorMessage';
import {
  Brain,
  Sparkles,
  Copy,
  RotateCcw,
  Trash2,
  BookOpen,
  CheckCircle2,
  ListOrdered,
  Lightbulb,
  FileCheck,
  Cpu,
} from 'lucide-react';

export const ExplainPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [concept, setConcept] = useState('');
  const [lastSubmittedConcept, setLastSubmittedConcept] = useState('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [style, setStyle] = useState<'Simple' | 'Detailed' | 'Example-based' | 'Exam-oriented'>('Simple');
  const [provider, setProvider] = useState<'gemini' | 'lamini-fallback'>('gemini');

  const [result, setResult] = useState<ExplanationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleConcepts = [
    'Pythagoras Theorem',
    'Photosynthesis',
    'Supply and Demand',
    'Blockchain and Cryptography',
    'Quantum Superposition',
  ];

  const handleExplain = async (overrideConcept?: string) => {
    const target = (overrideConcept || concept).trim();
    if (!target) {
      setError('Please enter a concept you want to understand.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setLastSubmittedConcept(target);

    try {
      const data = await api.ai.explainConcept({
        concept: target,
        difficulty,
        style,
        provider,
      });
      setResult(data);
      showToast('Concept explanation generated!');
    } catch (err: any) {
      setError(err?.message || 'Unable to generate concept explanation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const { explanation } = result;
    const textToCopy = `Concept: ${result.topic} (${result.difficulty} / ${result.style})\n\nDefinition:\n${explanation.definition}\n\nSimple Explanation:\n${explanation.simple_explanation}\n\nStep-by-Step Breakdown:\n${explanation.step_by_step
      .map((s, idx) => `${idx + 1}. ${s}`)
      .join('\n')}\n\nExample:\n${explanation.example}\n\nImportant Points:\n${explanation.important_points
      .map((p) => `• ${p}`)
      .join('\n')}\n\nQuick Revision:\n${explanation.quick_revision}`;
    navigator.clipboard.writeText(textToCopy);
    showToast('Copied full explanation to clipboard!');
  };

  const handleClear = () => {
    setConcept('');
    setResult(null);
    setError(null);
  };

  const difficultyOptions = [
    { value: 'Beginner', label: 'Beginner (Intuitive & Grounded)' },
    { value: 'Intermediate', label: 'Intermediate (Curriculum Standard)' },
    { value: 'Advanced', label: 'Advanced (Rigorous & Technical)' },
  ];

  const styleOptions = [
    { value: 'Simple', label: 'Simple (Plain English & Metaphors)' },
    { value: 'Detailed', label: 'Detailed (Deep In-Depth Analysis)' },
    { value: 'Example-based', label: 'Example-based (Real-World Scenarios)' },
    { value: 'Exam-oriented', label: 'Exam-oriented (Key Formulas & Tips)' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 sm:py-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
          <Brain className="w-4 h-4" />
          <span>Deep Concept Understanding</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          Explain Concept
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Deconstruct difficult academic concepts into logical steps, real-world examples, and quick revision notes.
        </p>
      </div>

      {/* Input Form Card */}
      <Card className="space-y-4">
        <div>
          <Input
            label="Concept or Topic to Understand"
            placeholder="Enter a concept (e.g. Pythagoras Theorem, DNA Replication)..."
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            disabled={isLoading}
            className="text-base"
          />
        </div>

        {/* Configuration Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Academic Difficulty"
            options={difficultyOptions}
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            disabled={isLoading}
          />
          <Select
            label="Explanation Style"
            options={styleOptions}
            value={style}
            onChange={(e) => setStyle(e.target.value as any)}
            disabled={isLoading}
          />
        </div>

        {/* Sample Concepts */}
        <div>
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Popular Academic Concepts:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleConcepts.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setConcept(item);
                  handleExplain(item);
                }}
                disabled={isLoading}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200/60 dark:border-slate-700/60"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Model Architecture Note */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            <span>Engine: Google Gemini Flash (with LaMini-Flan-T5 architectural adapter)</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={isLoading || (!concept && !result)}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Clear
            </Button>
            <Button
              size="md"
              onClick={() => handleExplain()}
              isLoading={isLoading}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Explain Concept
            </Button>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <AILoader
          title="EduGenie is analyzing the concept..."
          subtitle="Deconstructing core principles, identifying real-world analogies, and compiling revision points"
          type="explain"
        />
      )}

      {/* Error Message */}
      {error && !isLoading && (
        <ErrorMessage message={error} onRetry={() => handleExplain(lastSubmittedConcept)} />
      )}

      {/* Structured Explanation Result */}
      {result && !isLoading && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <Card className="p-6 space-y-6 border-indigo-200/80 dark:border-indigo-900/60 shadow-md">
            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {result.difficulty} • {result.style}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {result.topic}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  leftIcon={<Copy className="w-3.5 h-3.5" />}
                >
                  Copy All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExplain(lastSubmittedConcept)}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Regenerate
                </Button>
              </div>
            </div>

            {/* 1. Definition */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>1. Formal Academic Definition</span>
              </h4>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-sm text-slate-800 dark:text-slate-200 font-medium">
                {result.explanation.definition}
              </div>
            </div>

            {/* 2. Simple Explanation */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>2. Intuitive Explanation</span>
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {result.explanation.simple_explanation}
              </p>
            </div>

            {/* 3. Step-by-Step Understanding */}
            {result.explanation.step_by_step?.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <ListOrdered className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>3. Step-by-Step Breakdown</span>
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {result.explanation.step_by_step.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
                    >
                      <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Real-World Example */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>4. Concrete Real-World Example</span>
              </h4>
              <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60 text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 leading-relaxed">
                {result.explanation.example}
              </div>
            </div>

            {/* 5. Important Points */}
            {result.explanation.important_points?.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>5. Key Exam Tips & Important Points</span>
                </h4>
                <ul className="space-y-2">
                  {result.explanation.important_points.map((pt, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 6. Quick Revision Section */}
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-rose-500" />
                <span>6. Quick Revision Snapshot</span>
              </h4>
              <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs sm:text-sm text-amber-900 dark:text-amber-200 font-medium">
                {result.explanation.quick_revision}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
