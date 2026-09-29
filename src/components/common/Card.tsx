import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-all duration-200 ${
        hoverEffect ? 'hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700/60' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
