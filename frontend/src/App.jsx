import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './app/auth/AuthContext.jsx';
import { AppRouter } from './app/router/AppRouter.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
