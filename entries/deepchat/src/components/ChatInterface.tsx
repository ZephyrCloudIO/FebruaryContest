import React, { useRef, useEffect, useState } from 'react';
import { useModel } from '../contexts/ModelContext';
import { ModelLoadingIndicator } from './ModelLoadingIndicator';
import { MessageHydrator } from '../services/MessageHydrator';
import { useThreadContext } from '../contexts/ThreadContext';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChatBubbleLeftIcon,
  XMarkIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { ThreadList } from './ThreadList';

export const ChatInterface: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [modelError, setModelError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const newMessageRef = useRef<HTMLDivElement>(null);
  const hydratorRef = useRef<MessageHydrator | null>(null);

  const {
    activeThread,
    createThread,
    addMessage,
    streamingThreadId
  } = useThreadContext();

  const { initializeModel, generateStreamingResponse, loadingProgress, isLoading, isGenerating } = useModel();

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Add smooth scrolling
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    });
  }, [activeThread])
  useEffect(() => {
    if (activeThread?.id !== streamingThreadId) {
      if (newMessageRef.current) {
        newMessageRef.current.innerHTML = '';
      }
    }
  }, [activeThread, streamingThreadId]);

  useEffect(() => {
    const handleWorkerMessage = (event: CustomEvent<string>) => {
      if (hydratorRef.current) {
        hydratorRef.current.appendToken(event.detail, activeThread!.id === streamingThreadId);
      }
    };

    const handleStreamFinished = () => {
      if (!hydratorRef.current) return;

      console.log('done')

      const finalMessage = hydratorRef.current.getAndClearBuffer();

      if (newMessageRef.current) {
        newMessageRef.current.innerHTML = '';
      }

      addMessage(streamingThreadId!, {
        role: "assistant",
        content: finalMessage
      });

      hydratorRef.current = null;
    };

    const tokenHandler = handleWorkerMessage as EventListener;
    const streamHandler = handleStreamFinished as EventListener;

    window.addEventListener('onToken', tokenHandler);
    window.addEventListener("done", streamHandler);

    return () => {
      window.removeEventListener('onToken', tokenHandler);
      window.removeEventListener("done", streamHandler);
    };
  }, [activeThread?.id, addMessage]);

  useEffect(() => {
    const initModel = async () => {
      try {
        await initializeModel();
      } catch (error) {
        setModelError('Failed to initialize AI model. Please try again later.');
        console.error('Model initialization error:', error);
      }
    };

    initModel();
  }, []);

  const handleCreateNewThread = () => {
    createThread("New Chat");
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    setModelError(null);

    if (hydratorRef.current) {
      hydratorRef.current = null;
    }

    if (newMessageRef.current) {
      newMessageRef.current.innerHTML = '';
    }

    hydratorRef.current = new MessageHydrator(newMessageRef.current!, false);

    if (!activeThread) {
      createThread("New Chat", [{
        id: crypto.randomUUID(),
        role: "user",
        content: message
      }]);
    } else {
      addMessage(activeThread.id, {
        role: "user",
        content: message
      });
    }

    try {
      await generateStreamingResponse(message);
    } catch (error) {
      console.error('Error generating response:', error);
      setModelError('Failed to generate response. Please try again.');

      if (hydratorRef.current) {
        hydratorRef.current = null;
      }
      if (newMessageRef.current) {
        newMessageRef.current.innerHTML = '';
      }
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-[92px] flex bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-[84px] sm:top-[100px] left-4 z-50 p-2 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-200"
      >
        {isSidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
      </motion.button>

      <motion.div
        initial={false}
        animate={{
          x: isSidebarOpen ? 0 : -320,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 30
          }
        }}
        className={`fixed lg:relative w-80 h-full bg-gray-800 z-40 shadow-xl transform ${window.innerWidth >= 1024 ? 'translate-x-0' : ''
          }`}
      >
        <div className="flex flex-col h-full p-4 mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateNewThread}
            className="w-full bg-blue-600 text-white rounded-lg p-3 mb-6 hover:bg-blue-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md"
          >
            <ChatBubbleLeftIcon className="w-5 h-5" />
            <span className="font-medium">New Chat</span>
          </motion.button>
          <ThreadList
            onThreadSelect={() => {
              if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
              }
            }}
            className="flex-1"
          />
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col h-full relative">
        <AnimatePresence>
          {isLoading && <ModelLoadingIndicator progress={loadingProgress} />}
        </AnimatePresence>

        {modelError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md relative mb-4 mx-4 mt-4">
            {modelError}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4" id="message-list">
          <MessageList messages={activeThread?.messages ?? []}>
            <>
              <div className="flex justify-start" ref={newMessageRef}></div>
              <div ref={messagesEndRef} />
            </>
          </MessageList>
        </div>

        <ChatInput onSendMessage={handleSendMessage} isLoading={isGenerating} />
      </div>

      <AnimatePresence>
        {isSidebarOpen && window.innerWidth < 1024 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};