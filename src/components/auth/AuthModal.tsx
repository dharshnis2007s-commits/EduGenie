import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Input, Select } from '../common/FormElements';
import { Button } from '../common/Button';
import { Sparkles, Mail, Lock, User, GraduationCap, CheckCircle } from 'lucide-react';
import { useToast } from '../common/Toast';

export const AuthModal: React.FC = () => {
  const { authModalOpen, authModalTab, closeAuthModal, openAuthModal, login, register } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [educationLevel, setEducationLevel] = useState('High School');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);
  const [isForgotView, setIsForgotView] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isForgotView) {
        if (!email) {
          setError('Please provide your email address.');
          setIsSubmitting(false);
          return;
        }
        setForgotSent(true);
        showToast('Password reset link sent to your email.');
        setIsSubmitting(false);
        return;
      }

      if (authModalTab === 'login') {
        await login(email, password);
        showToast('Welcome back to EduGenie!');
      } else {
        if (!fullName.trim()) {
          setError('Please provide your full name.');
          setIsSubmitting(false);
          return;
        }
        await register(email, password, fullName, educationLevel);
        showToast('Account created! Welcome to EduGenie.');
      }
      closeAuthModal();
      // Reset form
      setEmail('');
      setPassword('');
      setFullName('');
      setIsForgotView(false);
      setForgotSent(false);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      // Try demo student login or auto register if not present
      try {
        await login('alex.student@edugenie.ai', 'edugenie123');
      } catch {
        await register('alex.student@edugenie.ai', 'edugenie123', 'Alex Student', 'College');
      }
      showToast('Logged in as Demo Student!');
      closeAuthModal();
    } catch (err: any) {
      setError(err?.message || 'Failed demo login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const eduOptions = [
    { value: 'Middle School', label: 'Middle School' },
    { value: 'High School', label: 'High School' },
    { value: 'College', label: 'College / University' },
    { value: 'Postgraduate', label: 'Postgraduate / Researcher' },
    { value: 'Lifelong Learner', label: 'Lifelong Learner' },
  ];

  return (
    <Modal
      isOpen={authModalOpen}
      onClose={() => {
        closeAuthModal();
        setIsForgotView(false);
        setForgotSent(false);
        setError(null);
      }}
      maxWidth="md"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {isForgotView
            ? 'Reset Your Password'
            : authModalTab === 'login'
            ? 'Welcome Back to EduGenie'
            : 'Join EduGenie Today'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {isForgotView
            ? 'Enter your registered email to receive recovery instructions'
            : authModalTab === 'login'
            ? 'Sign in to access your questions, quizzes, and learning path'
            : 'Start learning smarter with your personalized AI assistant'}
        </p>
      </div>

      {!isForgotView && (
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-5 text-sm font-semibold">
          <button
            type="button"
            onClick={() => {
              openAuthModal('login');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              authModalTab === 'login'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              openAuthModal('register');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              authModalTab === 'register'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {forgotSent ? (
        <div className="text-center py-6">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Instructions Dispatched</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            If an account matches {email}, a recovery link has been provided.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => {
              setIsForgotView(false);
              setForgotSent(false);
              openAuthModal('login');
            }}
          >
            Back to Sign In
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalTab === 'register' && !isForgotView && (
            <>
              <Input
                label="Full Name"
                placeholder="e.g. Maya Lin"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />
              <Select
                label="Academic Level"
                options={eduOptions}
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
              />
            </>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="student@example.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          {!isForgotView && (
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              hint={authModalTab === 'register' ? 'Minimum 6 characters' : undefined}
              required
            />
          )}

          {authModalTab === 'login' && !isForgotView && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsForgotView(true)}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Forgot password?
              </button>
            </div>
          )}

          <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
            {isForgotView
              ? 'Send Reset Link'
              : authModalTab === 'login'
              ? 'Sign In to EduGenie'
              : 'Create Free Student Account'}
          </Button>

          {isForgotView && (
            <Button
              type="button"
              variant="ghost"
              className="w-full text-xs"
              onClick={() => setIsForgotView(false)}
            >
              Back to Sign In
            </Button>
          )}

          {/* Quick Demo Access */}
          {!isForgotView && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Want to test features right away?</p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleDemoLogin}
                className="w-full text-xs"
                leftIcon={<GraduationCap className="w-4 h-4" />}
                isLoading={isSubmitting}
              >
                One-Click Demo Student Login
              </Button>
            </div>
          )}
        </form>
      )}
    </Modal>
  );
};
