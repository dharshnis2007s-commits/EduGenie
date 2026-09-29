import React from 'react';
import type { ActiveTab } from '../types';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import {
  Sparkles,
  Brain,
  HelpCircle,
  FileText,
  Compass,
  LayoutDashboard,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Zap,
  Target,
  GraduationCap,
} from 'lucide-react';

interface HomePageProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setActiveTab }) => {
  const { user, openAuthModal } = useAuth();

  const handleStart = () => {
    if (user) {
      setActiveTab('dashboard');
    } else {
      openAuthModal('register');
    }
  };

  const featureCards = [
    {
      tab: 'tutor' as ActiveTab,
      icon: <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      title: 'AI Q&A',
      desc: 'Ask questions and receive concise educational answers with key takeaways and follow-up prompts.',
    },
    {
      tab: 'explain' as ActiveTab,
      icon: <Brain className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      bg: 'bg-indigo-50 dark:bg-indigo-950/60',
      title: 'Simple Explanations',
      desc: 'Understand difficult concepts using beginner-friendly analogies, real-world examples, and quick revision.',
    },
    {
      tab: 'quiz' as ActiveTab,
      icon: <Sparkles className="w-6 h-6 text-amber-500 dark:text-amber-400" />,
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      title: 'Smart Quizzes',
      desc: 'Generate interactive multiple-choice tests from topics or study passages with instant grading and explanations.',
    },
    {
      tab: 'summarize' as ActiveTab,
      icon: <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      bg: 'bg-purple-50 dark:bg-purple-950/60',
      title: 'Instant Summaries',
      desc: 'Convert long textbooks and educational passages into high-yield revision bullet points and key vocabulary.',
    },
    {
      tab: 'path' as ActiveTab,
      icon: <Compass className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      title: 'Personalized Learning',
      desc: 'Get structured step-by-step learning roadmaps tailored to your available study time and academic goals.',
    },
    {
      tab: 'dashboard' as ActiveTab,
      icon: <LayoutDashboard className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
      bg: 'bg-rose-50 dark:bg-rose-950/60',
      title: 'Learning Dashboard',
      desc: 'Track completed quizzes, review past AI conversations, monitor test scores, and measure mastery over time.',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Enter your topic or question',
      desc: 'Type any academic subject, homework question, or paste text you are studying.',
    },
    {
      num: '02',
      title: 'Choose the learning tool',
      desc: 'Select Q&A, Concept Explanations, Quiz Generator, Summarizer, or Learning Planner.',
    },
    {
      num: '03',
      title: 'EduGenie processes with Gemini AI',
      desc: 'Our fine-tuned educational prompts structure the content for your specific grade and academic level.',
    },
    {
      num: '04',
      title: 'Receive structured response',
      desc: 'Get crystal-clear explanations, key points, interactive quizzes, or systematic roadmaps.',
    },
    {
      num: '05',
      title: 'Save and review your history',
      desc: 'Review past results anytime from your personal student dashboard and track your test progress.',
    },
  ];

  return (
    <div className="space-y-20 py-4 sm:py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-blue-50/70 via-indigo-50/30 to-transparent dark:from-blue-950/30 dark:via-slate-900/20 dark:to-transparent border border-blue-100/80 dark:border-blue-900/30 p-6 sm:p-12 lg:p-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google Gemini Powered Education Suite</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-[1.15]">
            Learn Smarter with <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">EduGenie</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            An AI-powered learning assistant that explains concepts, answers questions, creates quizzes, summarizes content, and builds personalized learning paths.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={handleStart}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Start Learning
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setActiveTab('tutor')}
              leftIcon={<HelpCircle className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Try AI Tutor
            </Button>
          </div>

          {/* Interactive Visual Banner / Teaser */}
          <div className="pt-8">
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl max-w-2xl mx-auto text-left space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[11px] font-semibold text-slate-400">EduGenie Live Concept Assistant</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 text-sm font-bold shadow-xs">
                  🧞‍♂️
                </div>
                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-200">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    "Pythagoras Theorem: In any right-angled triangle, the square of the hypotenuse equals the sum of the squares of the other two sides."
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Formula: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">a² + b² = c²</span> • Real-world use: Construction, GPS navigation, and game physics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Comprehensive Academic Toolkit
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Everything you need to master your syllabus, test your recall, and boost exam confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureCards.map((feat) => (
            <Card
              key={feat.title}
              hoverEffect
              onClick={() => setActiveTab(feat.tab)}
              className="cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className={`w-12 h-12 rounded-2xl ${feat.bg} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                  {feat.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                <span>Explore tool</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* "How EduGenie Works" Section */}
      <section className="rounded-3xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 lg:p-12 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Target className="w-4 h-4" />
            <span>Step-by-Step Flow</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            How EduGenie Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            From entering your first homework question to taking generated quizzes and tracking retention.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((st) => (
            <div
              key={st.num}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/70 dark:border-slate-800 space-y-2 relative"
            >
              <span className="text-2xl font-black text-blue-600/30 dark:text-blue-400/20">
                {st.num}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {st.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {st.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-8 sm:p-12 text-center text-white shadow-xl space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto text-2xl">
          🎓
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Start Your Learning Journey
        </h2>
        <p className="text-sm text-blue-100 max-w-xl mx-auto leading-relaxed">
          Join students everywhere using EduGenie to understand difficult topics, test knowledge with AI quizzes, and excel in their studies.
        </p>
        <div className="pt-2">
          <Button
            size="lg"
            variant="secondary"
            onClick={handleStart}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="bg-white text-blue-700 hover:bg-blue-50 border-transparent shadow-lg shadow-black/10"
          >
            Get Started Free
          </Button>
        </div>
      </section>
    </div>
  );
};
