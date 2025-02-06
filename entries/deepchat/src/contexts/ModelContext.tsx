import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import * as Comlink from 'comlink';
import type { ModelWorkerType, StatusEvent, TokenEvent } from '../workers/modelWorker';

export type ModelProgressCallback = (progress: ProgressStatusInfo) => void;

export interface ProgressStatusInfo {
  status: 'progress' | 'done';
  name: string;
  file: string;
  progress: number;
  loaded: number;
  total: number;
}

interface ModelContextState {
  isLoading: boolean;
  isGenerating: boolean;
  error: Error | null;
  loadingProgress?: ProgressStatusInfo;
  initializeModel: () => Promise<void>;
  generateStreamingResponse: (prompt: string) => Promise<void>;
}

const ModelContext = createContext<ModelContextState | null>(null);

export const ModelProvider = ({ children }: PropsWithChildren) => {
  const [worker] = useState(() => new Worker(new URL('../workers/modelWorker.ts', import.meta.url), {
    type: 'module'
  }));
  const [modelWorker] = useState(() => Comlink.wrap<ModelWorkerType>(worker));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<ProgressStatusInfo>();

  useEffect(() => {
    const handleWorkerMessage = (event: MessageEvent<StatusEvent | TokenEvent>) => {
      const { type, name } = event.data as StatusEvent;

      if (type === 'status') {
        const { progress } = event.data as StatusEvent;
        setLoadingProgress({ ...progress, name });
        setIsLoading(!(progress.status === 'done' && name === 'Model'))
      } else if (type === 'token') {
        if (!isGenerating) {
          setIsGenerating(true);
        }
        const tokenEvent = new CustomEvent('onToken', {
          detail: (event.data as TokenEvent).token
        });
        window.dispatchEvent(tokenEvent);
      } else {
        setIsGenerating(false);
        window.dispatchEvent(new CustomEvent('done'))
      }
    };

    worker.addEventListener('message', handleWorkerMessage);
    return () => worker.removeEventListener('message', handleWorkerMessage);
  }, [worker]);

  const initializeModel = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await modelWorker.initializeModel();
    } catch (error) {
      const err = error as Error;
      setError(err);
      console.error('Error initializing model:', err);
      throw err;
    }
  };

  const generateStreamingResponse = async (
    prompt: string
  ): Promise<void> => {
    try {
      await modelWorker.generateStreamingResponse(prompt);
    } catch (error) {
      console.error('Error in streaming response:', error);
      throw error;
    }
  };

  return (
    <ModelContext.Provider
      value={{
        isLoading,
        error,
        loadingProgress,
        isGenerating,
        initializeModel,
        generateStreamingResponse,
      }}
    >
      {children}
    </ModelContext.Provider>
  )
};

export const useModel = () => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
};