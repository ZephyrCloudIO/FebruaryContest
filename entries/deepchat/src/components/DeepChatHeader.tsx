import { FC } from 'react';
import {
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';;
import { useThreadContext } from '../contexts/ThreadContext';

export const DeepChatHeader: FC = () => {
  const { activeThread, threads } = useThreadContext();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-indigo-600" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
              DeepChat
            </h1>
          </div>
        </div>
        {activeThread && (
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <span className="truncate">
              Thread: {activeThread?.title || `Thread ${threads.indexOf(activeThread) + 1}`}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};