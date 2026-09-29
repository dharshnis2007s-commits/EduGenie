import React, { useState, useEffect } from 'react';
import type { ActiveTab, Profile } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../components/common/Toast';
import { Input, Select } from '../components/common/FormElements';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';
import {
  User as UserIcon,
  Mail,
  GraduationCap,
  Lock,
  LogOut,
  Save,
  CheckCircle2,
  Calendar,
  Shield,
} from 'lucide-react';

interface ProfilePageProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ setActiveTab }) => {
  const { user, logout, refreshUser, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [educationLevel, setEducationLevel] = useState('High School');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password reset state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEducationLevel(user.education_level || 'High School');
      api.profile
        .get()
        .then((p) => {
          setProfile(p);
          setFullName(p.full_name);
          setEducationLevel(p.education_level);
        })
        .catch(() => {});
    }
  }, [user]);

  if (!user) {
    return (
      <div className="py-12 max-w-xl mx-auto">
        <EmptyState
          icon={<UserIcon className="w-8 h-8" />}
          title="Profile & Settings"
          description="Log in to manage your student profile, academic level preferences, and account credentials."
          actionText="Log In / Sign Up"
          onAction={() => openAuthModal('login')}
        />
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await api.profile.update({
        full_name: fullName,
        education_level: educationLevel,
      });
      await refreshUser();
      showToast('Profile updated successfully!');
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await api.auth.resetPassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated securely!');
    } catch (err: any) {
      setPasswordError(err?.message || 'Unable to update password.');
    } finally {
      setIsUpdatingPassword(false);
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
    <div className="max-w-3xl mx-auto space-y-6 py-4 sm:py-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
            <UserIcon className="w-4 h-4" />
            <span>Account Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Student Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure your academic level so EduGenie AI can calibrate explanations to your study requirements.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/60"
          onClick={() => {
            logout();
            setActiveTab('home');
          }}
          leftIcon={<LogOut className="w-4 h-4" />}
        >
          Logout
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Profile Info Card */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            {user.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {user.full_name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{user.email}</span>
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                {user.education_level}
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                <Shield className="w-3 h-3 text-emerald-500" />
                Verified Student
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Select
              label="Target Academic Level"
              options={eduOptions}
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              size="md"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Security & Password Update */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Update Password
          </h3>
        </div>

        {passwordError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-300">
            {passwordError}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              hint="Minimum 6 characters"
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="outline"
              size="sm"
              isLoading={isUpdatingPassword}
              disabled={!newPassword || !confirmPassword}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
