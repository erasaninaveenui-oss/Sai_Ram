import React from 'react';
import Dashboard from './components/Dashboard';
import LoginScreen from './components/LoginScreen';
import { getSession, storeSession, removeSession } from './services/sheetService';

const App: React.FC = () => {
  // Authentication state is determined by the presence of a valid session token in sessionStorage.
  // This function runs only once on initial component mount, providing a simple and effective
  // way to persist the user's logged-in state across page reloads.
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(
    () => !!getSession()
  );

  const handleLoginSuccess = React.useCallback((token: string) => {
    storeSession(token);
    setIsAuthenticated(true);
  }, []);

  const handleLogout = React.useCallback(() => {
    removeSession();
    setIsAuthenticated(false);
  }, []);

  React.useEffect(() => {
    const handleSessionExpired = () => {
      handleLogout();
    };

    window.addEventListener('session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, [handleLogout]);

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return <Dashboard onLogout={handleLogout} />;
};

export default App;
