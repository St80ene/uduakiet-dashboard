import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Home, AlertTriangle, MessageSquare } from 'lucide-react';

interface ErrorPageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onNavigateHome?: () => void;
  onReportIssue?: () => void;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({
  title = 'Something went wrong',
  message = "We ran into an unexpected issue while loading this page. Don't worry, your data is safe.",
  onRetry = () => window.location.reload(),
  onNavigateHome,
  onReportIssue,
}) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-md w-full text-center bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-700/60"
      >
        {/* Animated Warning Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6"
        >
          <AlertTriangle className="w-8 h-8" />
        </motion.div>

        {/* Messaging */}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {title}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 leading-relaxed">
          {message}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onRetry}
            className="w-full flex items-center cursor-pointer justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all shadow-md shadow-indigo-500/20 active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <button
            onClick={onNavigateHome}
            className="w-full flex items-center cursor-pointer justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium transition-all active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            Return to Dashboard
          </button>

          {onReportIssue && (
            <button
              onClick={onReportIssue}
              className="mt-2 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Report this issue to support
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
