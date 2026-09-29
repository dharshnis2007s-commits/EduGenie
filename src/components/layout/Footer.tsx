import React, { useState } from 'react';
import type { ActiveTab } from '../../types';
import { ShieldCheck, Info } from 'lucide-react';
import { Modal } from '../common/Modal';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  return (
    <footer className="mt-20 border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xs text-slate-600 dark:text-slate-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧞‍♂️</span>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
                EduGenie
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              "Your AI-Powered Learning Assistant"
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              Empowering students across all academic levels to learn smarter, understand complex concepts faster, and build continuous study habits through Google Gemini.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200/60 dark:border-blue-900/60">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Server-Secured Gemini AI Architecture</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Learning Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('tutor'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  AI Tutor & Q&A
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('explain'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Concept Explanations
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('quiz'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  AI Quiz Generator
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('summarize'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Text Summarizer
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('path'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Personalized Learning Path
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Privacy */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Trust & Ethics
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setPrivacyModalOpen(true)}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Privacy Notice
                </button>
              </li>
              <li>
                <button
                  onClick={() => setTermsModalOpen(true)}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Student Dashboard
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Academic Disclaimer Box */}
        <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5 mb-6">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-semibold">Academic Disclaimer:</span> AI-generated answers may contain mistakes. Verify important academic information with trusted educational textbooks, official syllabi, and educators.
          </p>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 dark:text-slate-400">
          <div>© 2026 EduGenie. All rights reserved.</div>
          <div>"Learn smarter. Understand faster. Grow continuously."</div>
        </div>
      </div>

      {/* Privacy Notice Modal */}
      <Modal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        title="Privacy and Responsible AI Notice"
        maxWidth="lg"
      >
        <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            At EduGenie, student privacy and responsible educational technology are top priorities.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>AI Processing:</strong> Educational prompts and passages submitted are processed server-side through the Google Gemini API to produce smart explanations and quizzes.
            </li>
            <li>
              <strong>Personal Learning History:</strong> Saved queries, quizzes, and learning paths are isolated strictly to your own user account with row-level security.
            </li>
            <li>
              <strong>Key Protection:</strong> Gemini API keys are never transmitted to client devices or browser code.
            </li>
            <li>
              <strong>Full Control:</strong> You can permanently delete any saved Q&A, quiz, or summary from the History tab at any time.
            </li>
          </ul>
        </div>
      </Modal>

      {/* Terms Modal */}
      <Modal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        title="Terms of Service"
        maxWidth="lg"
      >
        <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            EduGenie is intended as a supplemental study and revision aid for students, teachers, and curious learners worldwide.
          </p>
          <p>
            Users agree not to input copyrighted exam materials in violation of institutional codes. All generated materials should be independently confirmed prior to formal academic examinations.
          </p>
        </div>
      </Modal>
    </footer>
  );
};
