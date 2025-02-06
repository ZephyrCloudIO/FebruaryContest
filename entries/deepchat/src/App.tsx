import { FC } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChatInterface } from './components/ChatInterface';
import { DeepChatHeader } from './components/DeepChatHeader';
import { ModelProvider } from './contexts/ModelContext';
import { ThreadProvider } from './contexts/ThreadContext';

const App: FC = () => {
  return (
    <ModelProvider>
      <ThreadProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <DeepChatHeader />
            <main className="flex-1 flex flex-col relative">
              <div className="w-full h-full flex-1">
                <Routes>
                  <Route
                    path="/"
                    element={<ChatInterface />}
                  />
                </Routes>
              </div>
            </main>
          </div>
        </Router>
      </ThreadProvider>
    </ModelProvider>
  );
};

export default App;