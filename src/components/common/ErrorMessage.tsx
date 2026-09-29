import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message = 'Something went wrong. Please check your connection and try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
        <div>
          <h5 className="text-sm font-semibold text-red-900 dark:text-red-200">Unable to complete request</h5>
          <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="shrink-0 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
