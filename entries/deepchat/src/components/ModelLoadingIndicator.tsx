import React from 'react';
import { motion } from 'framer-motion';
import { ProgressStatusInfo } from '../contexts/ModelContext';

interface ModelLoadingIndicatorProps {
  progress: ProgressStatusInfo | undefined;
}

export const ModelLoadingIndicator: React.FC<ModelLoadingIndicatorProps> = ({ progress }) => {
  const calculatePercentage = (): number => {
    if (!progress?.progress) return 0;
    if (progress.status === 'done') return 0;

    // Since progress is already in decimal form (e.g., 0.13569),
    // we just need to multiply by 100 to get the percentage
    const percentage = Math.round(progress.progress);
    return Number.isNaN(percentage) ? 0 : Math.min(percentage, 100);
  };

  const percentage = calculatePercentage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm bg-gray-900/50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white rounded-xl p-6 sm:p-8 max-w-md w-[90%] sm:w-full mx-4 shadow-2xl border border-gray-100"
      >
        <div className="text-center">
          <motion.h2
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800"
          >
            Loading {progress?.name}
          </motion.h2>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-100">
                  Progress
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-blue-600">
                  {percentage}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-blue-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
              />
            </div>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-600 text-sm mt-2"
          >
            {progress?.status !== "done"
              ? 'Please wait while we initialize the AI model...'
              : 'Almost ready...'}
          </motion.p>
          {percentage < 25 && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gray-500 text-xs mt-4"
            >
              Initial load may take a few moments
            </motion.p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};