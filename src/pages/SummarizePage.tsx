import React, { useState } from 'react';
import { api } from '../services/api';
import type { SummaryResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { TextArea, Select } from '../components/common/FormElements';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { AILoader } from '../components/common/LoadingStates';
import { ErrorMessage } from '../components/common/ErrorMessage';
import {
  FileText,
  Sparkles,
  Copy,
  Trash2,
  CheckCircle2,
  Bookmark,
  BookOpen,
  FileCheck,
  ListOrdered,
} from 'lucide-react';

export const SummarizePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [text, setText] = useState('');
  const [length, setLength] = useState<'Short' | 'Medium' | 'Detailed'>('Medium');
  const [style, setStyle] = useState<'Simple' | 'Exam Revision' | 'Bullet Points'>('Simple');

  const [result, setResult] = useState<SummaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const samplePassage = `Photosynthesis is a vital biological process used by green plants, algae, and certain bacteria to convert light energy into chemical energy. Cellular chlorophyll pigments in chloroplasts absorb photons from solar radiation, primarily in the blue and red wavelengths of the electromagnetic spectrum. 

During the light-dependent reactions taking place in the thylakoid membrane, water molecules (H2O) undergo photolysis, releasing diatomic oxygen gas (O2) into the atmosphere as a byproduct, while synthesizing ATP and NADPH. Subsequently, during the Calvin cycle in the stroma (light-independent reactions), atmospheric carbon dioxide (CO2) is captured and enzymatically reduced by RuBisCO to synthesize high-energy hexose carbohydrates such as glucose. This glucose serves as a fundamental energy source for cellular respiration and metabolic processes throughout the global trophic web.`;

  const handleSummarize = async (overrideText?: string) => {
    const target = (overrideText || text).trim();
    if (!target || target.length < 20) {
      setError('Please provide at least 20 characters of educational text to summarize.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const data = await api.ai.summarize({
        text: target,
        length,
        style,
      });
      setResult(data);
      showToast('Educational text summarized!');
    } catch (err: any) {
      setError(err?.message || 'Unable to generate summary.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `Summary (${length} / ${style}):\n${result.summary}\n\nKey Points:\n${result.key_points
      .map((k) => `• ${k}`)
      .join('\n')}\n\nImportant Terms:\n${result.important_terms
      .map((t) => `• ${t.term}: ${t.definition}`)
      .join('\n')}\n\nQuick Revision:\n${result.quick_revision}`;
    navigator.clipboard.writeText(textToCopy);
    showToast('Copied summary and terms to clipboard!');
  };

  const handleClear = () => {
    setText('');
    setResult(null);
    setError(null);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const lengthOptions = [
    { value: 'Short', label: 'Short (High-Level Overview)' },
    { value: 'Medium', label: 'Medium (Balanced Core Details)' },
    { value: 'Detailed', label: 'Detailed (Exhaustive Academic Review)' },
  ];

  const styleOptions = [
    { value: 'Simple', label: 'Simple (Plain Student-Friendly Prose)' },
    { value: 'Exam Revision', label: 'Exam Revision (High-Yield Memory Hooks)' },
    { value: 'Bullet Points', label: 'Bullet Points (Concise Outline)' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 sm:py-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
          <FileText className="w-4 h-4" />
          <span>Educational Text Synthesis</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          Instant Summaries
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Convert long passages and textbook chapters into concise revision notes, key concepts, and term glossaries.
        </p>
      </div>

      {/* Input Card */}
      <Card className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Source Study Passage
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {wordCount} words
            </span>
          </div>
          <TextArea
            placeholder="Paste your educational text here (e.g. textbook section, scientific article, history lecture)..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
            className="min-h-[160px] text-sm"
          />
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Summary Length"
            options={lengthOptions}
            value={length}
            onChange={(e) => setLength(e.target.value as any)}
            disabled={isLoading}
          />
          <Select
            label="Summary Style"
            options={styleOptions}
            value={style}
            onChange={(e) => setStyle(e.target.value as any)}
            disabled={isLoading}
          />
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setText(samplePassage);
              handleSummarize(samplePassage);
            }}
            disabled={isLoading}
            className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium hover:underline cursor-pointer"
          >
            Insert Sample Environmental Science Text
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={isLoading || (!text && !result)}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Clear
            </Button>
            <Button
              size="md"
              onClick={() => handleSummarize()}
              isLoading={isLoading}
              leftIcon={<Sparkles className="w-4 h-4" />}
              className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 text-white"
            >
              Summarize Content
            </Button>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <AILoader
          title="Summarizing your content..."
          subtitle="Distilling key takeaways, removing redundant repetition, and constructing an academic term glossary"
          type="summary"
        />
      )}

      {/* Error Message */}
      {error && !isLoading && (
        <ErrorMessage message={error} onRetry={() => handleSummarize()} />
      )}

      {/* Summary Output */}
      {result && !isLoading && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <Card className="p-6 space-y-6 border-purple-200/80 dark:border-purple-900/60 shadow-md">
            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  {length} • {style}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  Synthesized Study Notes
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  leftIcon={<Copy className="w-3.5 h-3.5" />}
                >
                  Copy Notes
                </Button>
                {user && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Saved to History</span>
                  </span>
                )}
              </div>
            </div>

            {/* 1. Core Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Executive Summary</span>
              </h4>
              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                {result.summary}
              </p>
            </div>

            {/* 2. Key Points */}
            {result.key_points?.length > 0 && (
              <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Key Points & Takeaways</span>
                </h4>
                <ul className="space-y-2">
                  {result.key_points.map((pt, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 3. Important Terms Glossary */}
            {result.important_terms?.length > 0 && (
              <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <ListOrdered className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Important Terms Glossary</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.important_terms.map((termItem, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1"
                    >
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {termItem.term}
                      </div>
                      <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {termItem.definition}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Quick Revision */}
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-rose-500" />
                <span>Quick Revision Flash Note</span>
              </h4>
              <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 text-xs sm:text-sm text-purple-950 dark:text-purple-200 font-medium">
                {result.quick_revision}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
