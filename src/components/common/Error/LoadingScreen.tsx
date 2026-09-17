import React from 'react';
import { motion } from 'framer-motion';
import { UduaKietLogo } from '@/components/Nav/AppLogo';

interface LoadingScreenProps {
  label?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  label = 'Loading workspace...',
}) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full max-w-2xl space-y-6"
      >
        {/* Brand Mark */}
        <div className="flex flex-col items-center gap-3 mb-2">
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400"
          >
            <UduaKietLogo className="w-6 h-6" />
          </motion.div>
          <span className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200">
            UduaKiet
          </span>
        </div>

        {/* Top Status Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {label}
            </span>
          </div>
        </div>

        {/* Indeterminate Progress Line */}
        <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'easeInOut',
            }}
            style={{ width: '50%' }}
          />
        </div>

        {/* Skeleton UI Card Preview */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3 mb-6" />

          <div className="space-y-3">
            <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-full" />
            <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-5/6" />
            <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-2/3" />
          </div>

          <div className="pt-4 flex gap-3">
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-28" />
            <div className="h-10 bg-slate-100 dark:bg-slate-800/40 rounded-lg w-28" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
