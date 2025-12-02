import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LoginScreen } from './components/LoginScreen';
import { useAuth } from './src/hooks/useAuth';

/**
 * ルートコンポーネント
 * 認証状態に応じてログイン画面またはメインアプリを表示
 */
const Root: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <App />;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);