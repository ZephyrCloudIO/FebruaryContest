import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp?: number;
}

export interface Thread {
    id: string;
    title: string;
    messages: Message[];
    isPinned?: boolean;
    isArchived?: boolean;
    lastUpdated: number;
    createdAt: number;
    category?: string;
    summary?: string;
}

interface ThreadContextType {
    threads: Thread[];
    activeThread: Thread | null;
    streamingThreadId: string | null;
    setActiveThread: (thread: Thread | null) => void;
    createThread: (title: string, messages?: Message[]) => Thread;
    addMessage: (threadId: string, message: Omit<Message, 'id'>) => Message | null;
    deleteThread: (threadId: string) => void;
    clearThreadMessages: (threadId: string) => void;
    updateThreadTitle: (threadId: string, title: string) => void;
    pinThread: (threadId: string) => void;
    archiveThread: (threadId: string) => void;
    updateThreadCategory: (threadId: string, category: string) => void;
    updateThreadSummary: (threadId: string, summary: string) => void;
    getFilteredThreads: (filter: { isPinned?: boolean; isArchived?: boolean; category?: string }) => Thread[];
    searchThreads: (query: string) => Thread[];
}

const ThreadContext = createContext<ThreadContextType | null>(null);

const STORAGE_KEY = 'chatThreads';
const ACTIVE_THREAD_KEY = 'activeThread';

export const ThreadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [threads, setThreads] = useState<Thread[]>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    });

    const [activeThread, setActiveThread] = useState<Thread | null>(() => {
        const stored = localStorage.getItem(ACTIVE_THREAD_KEY);
        return stored ? JSON.parse(stored) : null;
    });

    const [streamingThreadId, setStreamingThreadId] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    }, [threads]);

    useEffect(() => {
        localStorage.setItem(ACTIVE_THREAD_KEY, JSON.stringify(activeThread));
    }, [activeThread]);

    const createThread = (title: string, messages: Message[] = []) => {
        const now = Date.now();
        const newThread: Thread = {
            id: crypto.randomUUID(),
            messages: messages.map(m => ({ ...m, timestamp: now })),
            title,
            createdAt: now,
            lastUpdated: now,
            isPinned: false,
            isArchived: false
        };

        setThreads(prev => [newThread, ...prev]);
        setActiveThread(newThread);
        setStreamingThreadId(newThread.id);
        return newThread;
    };

    const addMessage = (threadId: string, message: Omit<Message, 'id'>) => {
        const threadIndex = threads.findIndex(t => t.id === threadId);
        if (threadIndex === -1) return null;

        const now = Date.now();
        const newMessage: Message = {
            ...message,
            id: crypto.randomUUID(),
            timestamp: now,
        };

        setStreamingThreadId(threadId);

        setThreads(prev => {
            const updated = [...prev];
            updated[threadIndex] = {
                ...updated[threadIndex],
                messages: [...updated[threadIndex].messages, newMessage],
                lastUpdated: now,
            };
            return updated;
        });

        if (activeThread?.id === threadId) {
            setActiveThread(prev => prev ? {
                ...prev,
                messages: [...prev.messages, newMessage],
                lastUpdated: now,
            } : null);
        }

        return newMessage;
    };

    const deleteThread = (threadId: string) => {
        setThreads(prev => prev.filter(t => t.id !== threadId));
        if (activeThread?.id === threadId) {
            setActiveThread(threads[0] || null);
        }
    };

    const clearThreadMessages = (threadId: string) => {
        const now = Date.now();
        setThreads(prev => {
            const threadIndex = prev.findIndex(t => t.id === threadId);
            if (threadIndex === -1) return prev;

            const updated = [...prev];
            updated[threadIndex] = {
                ...updated[threadIndex],
                messages: [],
                lastUpdated: now,
            };
            return updated;
        });
    };

    const updateThreadTitle = (threadId: string, title: string) => {
        const now = Date.now();
        setThreads(prev => {
            const threadIndex = prev.findIndex(t => t.id === threadId);
            if (threadIndex === -1) return prev;

            const updated = [...prev];
            updated[threadIndex] = {
                ...updated[threadIndex],
                title,
                lastUpdated: now,
            };
            return updated;
        });
    };

    const pinThread = (threadId: string) => {
        setThreads(prev => {
            const threadIndex = prev.findIndex(t => t.id === threadId);
            if (threadIndex === -1) return prev;

            const updated = [...prev];
            updated[threadIndex] = {
                ...updated[threadIndex],
                isPinned: !updated[threadIndex].isPinned,
            };
            return updated;
        });
    };

    const archiveThread = (threadId: string) => {
        setThreads(prev => {
            const threadIndex = prev.findIndex(t => t.id === threadId);
            if (threadIndex === -1) return prev;

            const updated = [...prev];
            updated[threadIndex] = {
                ...updated[threadIndex],
                isArchived: !updated[threadIndex].isArchived,
            };
            return updated;
        });
    };

    const updateThreadCategory = (threadId: string, category: string) => {
        setThreads(prev => {
            const threadIndex = prev.findIndex(t => t.id === threadId);
            if (threadIndex === -1) return prev;

            const updated = [...prev];
            updated[threadIndex] = {
                ...updated[threadIndex],
                category,
            };
            return updated;
        });
    };

    const updateThreadSummary = (threadId: string, summary: string) => {
        setThreads(prev => {
            const threadIndex = prev.findIndex(t => t.id === threadId);
            if (threadIndex === -1) return prev;

            const updated = [...prev];
            updated[threadIndex] = {
                ...updated[threadIndex],
                summary,
            };
            return updated;
        });
    };

    const getFilteredThreads = (filter: { isPinned?: boolean; isArchived?: boolean; category?: string }) => {
        return threads.filter(thread => {
            if (filter.isPinned !== undefined && thread.isPinned !== filter.isPinned) return false;
            if (filter.isArchived !== undefined && thread.isArchived !== filter.isArchived) return false;
            if (filter.category && thread.category !== filter.category) return false;
            return true;
        });
    };

    const searchThreads = (query: string) => {
        const searchTerm = query.toLowerCase();
        return threads.filter(thread => {
            const titleMatch = thread.title.toLowerCase().includes(searchTerm);
            const contentMatch = thread.messages.some(m =>
                m.content.toLowerCase().includes(searchTerm)
            );
            return titleMatch || contentMatch;
        });
    };

    return (
        <ThreadContext.Provider value={{
            threads,
            activeThread,
            streamingThreadId,
            setActiveThread,
            createThread,
            addMessage,
            deleteThread,
            clearThreadMessages,
            updateThreadTitle,
            pinThread,
            archiveThread,
            updateThreadCategory,
            updateThreadSummary,
            getFilteredThreads,
            searchThreads,
        }}>
            {children}
        </ThreadContext.Provider>
    );
};

export const useThreadContext = () => {
    const context = useContext(ThreadContext);
    if (!context) {
        throw new Error('useThreadContext must be used within a ThreadProvider');
    }
    return context;
};