import React, { useState, useEffect } from 'react';
import type { ActiveTab } from './types';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/auth/AuthModal';

import { HomePage } from './pages/HomePage';
import { AITutorPage } from './pages/AITutorPage';
import { ExplainPage } from './pages/ExplainPage';
import { QuizPage } from './pages/QuizPage';
import { SummarizePage } from './pages/SummarizePage';
import { LearningPathPage } from './pages/LearningPathPage';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';

function EduGenieApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Handle URL hash navigation if user opens a direct deep link or presses back
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as ActiveTab;
      const validTabs: ActiveTab[] = [
        'home',
        'tutor',
        'explain',
        'quiz',
        'summarize',
        'path',
        'dashboard',
        'history',
        'profile',
      ];
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      <Navbar activeTab={activeTab} setActiveTab={handleTabChange} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {activeTab === 'home' && <HomePage setActiveTab={handleTabChange} />}
        {activeTab === 'tutor' && <AITutorPage />}
        {activeTab === 'explain' && <ExplainPage />}
        {activeTab === 'quiz' && <QuizPage />}
        {activeTab === 'summarize' && <SummarizePage />}
        {activeTab === 'path' && <LearningPathPage />}
        {activeTab === 'dashboard' && <DashboardPage setActiveTab={handleTabChange} />}
        {activeTab === 'history' && <HistoryPage setActiveTab={handleTabChange} />}
        {activeTab === 'profile' && <ProfilePage setActiveTab={handleTabChange} />}
      </main>

      <Footer setActiveTab={handleTabChange} />
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <EduGenieApp />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
