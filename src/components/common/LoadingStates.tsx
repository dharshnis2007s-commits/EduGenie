import React from 'react';
import { Sparkles, Brain, BookOpen, ListOrdered } from 'lucide-react';

interface AILoaderProps {
  title?: string;
  subtitle?: string;
  type?: 'general' | 'quiz' | 'explain' | 'summary' | 'path';
}

export const AILoader: React.FC<AILoaderProps> = ({
  title = 'EduGenie is thinking...',
  subtitle = 'Crafting an accurate, student-friendly response with Google Gemini',
  type = 'general',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'quiz':
        return <ListOrdered className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-bounce" />;
      case 'explain':
        return <Brain className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />;
      case 'summary':
        return <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-pulse" />;
      case 'path':
        return <Sparkles className="w-8 h-8 text-amber-500 dark:text-amber-400 animate-spin" />;
      default:
        return <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-blue-100 dark:border-blue-900/40 backdrop-blur-xs shadow-xs animate-in fade-in duration-300">
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/70 flex items-center justify-center border border-blue-200 dark:border-blue-800 shadow-inner">
          {getIcon()}
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-75" />
      </div>

      <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1.5 flex items-center gap-2">
        <span>{title}</span>
      </h4>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm">
        {subtitle}
      </p>

      {/* Animated loading bar */}
      <div className="w-48 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-5 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full animate-pulse w-3/4" />
      </div>
    </div>
  );
};
