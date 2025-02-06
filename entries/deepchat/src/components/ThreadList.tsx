import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PencilIcon,
  TrashIcon,
  StarIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { Thread, useThreadContext } from '../contexts/ThreadContext';

interface ThreadListProps {
  onThreadSelect?: (thread: Thread) => void;
  className?: string;
}

export const ThreadList: React.FC<ThreadListProps> = ({ onThreadSelect, className = '' }) => {
  const {
    threads,
    activeThread,
    setActiveThread,
    deleteThread,
    updateThreadTitle,
    pinThread,
    getFilteredThreads,
    searchThreads,
  } = useThreadContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pinned' | 'archived'>('all');

  const handleEditThread = (threadId: string, title: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingThreadId(threadId);
    setEditTitle(title);
  };

  const handleSaveThreadTitle = (threadId: string) => {
    if (editTitle.trim()) {
      updateThreadTitle(threadId, editTitle.trim());
    }
    setEditingThreadId(null);
    setEditTitle('');
  };

  const handleDeleteThread = (threadId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    deleteThread(threadId);
  };

  const handlePinThread = (threadId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    pinThread(threadId);
  };

  const getFilteredAndSearchedThreads = () => {
    let filteredThreads = threads;

    if (filterType === 'pinned') {
      filteredThreads = getFilteredThreads({ isPinned: true });
    } else if (filterType === 'archived') {
      filteredThreads = getFilteredThreads({ isArchived: true });
    }

    if (searchQuery) {
      filteredThreads = searchThreads(searchQuery);
    }

    return filteredThreads;
  };

  const getThreadPreview = (messages: any[]) => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return 'No messages';
    return lastMessage.content.replace("<think>", "").replace("</think>", "").slice(0, 30) + (lastMessage.content.length > 30 ? '...' : '');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="p-4 space-y-4">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-full text-sm ${filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('pinned')}
            className={`px-3 py-1 rounded-full text-sm ${filterType === 'pinned' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            Pinned
          </button>
          <button
            onClick={() => setFilterType('archived')}
            className={`px-3 py-1 rounded-full text-sm ${filterType === 'archived' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            Archived
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
        <AnimatePresence>
          {getFilteredAndSearchedThreads().map(thread => (
            <motion.div
              key={thread.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.02 }}
              className={`group relative rounded-lg overflow-hidden ${activeThread?.id === thread.id
                ? 'bg-blue-600 shadow-lg'
                : 'bg-gray-700 hover:bg-gray-600'
                } transition-all duration-200`}
            >
              <button
                onClick={() => {
                  setActiveThread(thread);
                  onThreadSelect?.(thread);
                }}
                className="w-full text-left p-3 pr-24"
              >
                <div className="flex flex-col space-y-1">
                  {editingThreadId === thread.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleSaveThreadTitle(thread.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveThreadTitle(thread.id)}
                      className="bg-transparent text-white font-medium focus:outline-none w-full"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${activeThread?.id === thread.id ? 'text-white' : 'text-gray-200'}`}>
                        {thread.title || 'Untitled Chat'}
                      </span>
                    </div>
                  )}
                  <span className={`text-sm ${activeThread?.id === thread.id ? 'text-blue-200' : 'text-gray-400'}`}>
                    {getThreadPreview(thread.messages)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(thread.lastUpdated)}
                  </span>
                </div>
              </button>

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => handlePinThread(thread.id, e)}
                  className={`p-1 rounded-full hover:bg-gray-600/50 transition-colors ${thread.isPinned ? 'text-yellow-400' : 'text-gray-300 hover:text-white'
                    }`}
                >
                  <StarIcon className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => handleEditThread(thread.id, thread.title, e)}
                  className="p-1 rounded-full hover:bg-gray-600/50 text-gray-300 hover:text-white transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => handleDeleteThread(thread.id, e)}
                  className="p-1 rounded-full hover:bg-gray-600/50 text-gray-300 hover:text-white transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};