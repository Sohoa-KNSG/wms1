import React, { createContext, useContext, useState, useEffect } from 'react';
import { httpClient } from '../../api/httpClient.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount/refresh
  useEffect(() => {
    const savedToken = localStorage.getItem('wms_token');
    const savedUser = localStorage.getItem('wms_user');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        setMustChangePassword(!!parsedUser.must_change_password);
      } catch (e) {
        logout();
      }
    }
    setLoading(false);

    // Listen for unauthorized 401 events from httpClient
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('wms_auth_unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('wms_auth_unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (username, password) => {
    const response = await httpClient.post('/auth/login', { username, password });

    // API contract: { status, data: { token, user } }
    const data = response.data || response;
    const jwtToken = data.token;
    const userData = data.user;

    setToken(jwtToken);
    setUser(userData);
    setMustChangePassword(!!userData.must_change_password);

    localStorage.setItem('wms_token', jwtToken);
    localStorage.setItem('wms_user', JSON.stringify(userData));

    return response;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setMustChangePassword(false);
    localStorage.removeItem('wms_token');
    localStorage.removeItem('wms_user');
  };

  const changePasswordSuccess = () => {
    if (user) {
      const updatedUser = { ...user, must_change_password: false };
      setUser(updatedUser);
      setMustChangePassword(false);
      localStorage.setItem('wms_user', JSON.stringify(updatedUser));
    }
  };

  // SEC-03: hasPermission kiểm tra capabilities[] từ JWT/user data
  // KHÔNG dùng username fallback hoặc roles.length === 0 để cấp toàn quyền
  const hasPermission = (permissionOrRole) => {
    if (!user) return false;
    const roles = user.roles || user.Roles || [];
    const normalizedRoles = roles.map(r => String(r).toUpperCase());

    // Admin & Operational core roles have full access
    if (normalizedRoles.some(r => ['ADMIN', 'IT_ADMIN', 'SUPER_ADMIN', 'STOREKEEPER', 'OPERATOR'].includes(r))) {
      return true;
    }

    // Check capabilities / permissions array from user object
    const capabilities = user.capabilities || user.permissions || user.Permissions || [];
    if (capabilities.includes(permissionOrRole)) return true;

    // Check permission match role
    if (roles.includes(permissionOrRole)) return true;

    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        mustChangePassword,
        loading,
        login,
        logout,
        changePasswordSuccess,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
