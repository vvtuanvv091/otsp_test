import React, { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user') || sessionStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => (
    localStorage.getItem('token')
    || sessionStorage.getItem('token')
    || localStorage.getItem('otsp_token')
    || ''
  ));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('otsp:unauthorized', handleUnauthorized);

    const fetchMe = async () => {
      const storedToken = localStorage.getItem('token')
        || sessionStorage.getItem('token')
        || localStorage.getItem('otsp_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const res = await authApi.getMe();
          setUser(res.data);
          if (localStorage.getItem('token')) {
            localStorage.setItem('user', JSON.stringify(res.data));
          } else {
            sessionStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.error('Lỗi khi lấy thông tin user:', err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchMe();
    return () => window.removeEventListener('otsp:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password, rememberMe = false) => {
    const res = await authApi.login({ email: email?.trim(), password, rememberMe });
    const { token: jwtToken, user: userInfo } = res.data;
    if (rememberMe) {
      // Ghi nhớ đăng nhập: lưu vào localStorage (persist qua restart browser)
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userInfo));
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    } else {
      // Không ghi nhớ: chỉ lưu vào sessionStorage (xóa khi đóng tab)
      sessionStorage.setItem('token', jwtToken);
      sessionStorage.setItem('user', JSON.stringify(userInfo));
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setToken(jwtToken);
    setUser(userInfo);
    return userInfo;
  };

  const register = async (registerData) => {
    const res = await authApi.register(registerData);
    const { token: jwtToken, user: userInfo } = res.data;
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userInfo));
    setToken(jwtToken);
    setUser(userInfo);
    return userInfo;
  };

  const loginWithGoogle = async (googleData) => {
    const res = await authApi.googleLogin(googleData);
    const { token: jwtToken, user: userInfo } = res.data;
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userInfo));
    setToken(jwtToken);
    setUser(userInfo);
    return userInfo;
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  };

  const updateUser = (updates) => {
    setUser((current) => {
      if (!current) return current;
      const nextUser = { ...current, ...updates };
      localStorage.setItem('user', JSON.stringify(nextUser));
      if (sessionStorage.getItem('user')) sessionStorage.setItem('user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const roles = [
    ...(Array.isArray(user?.roles) ? user.roles : []),
    ...(Array.isArray(user?.Roles) ? user.Roles : []),
    user?.role,
    user?.Role,
    user?.roleName,
  ].filter(Boolean).map((role) => String(role).trim().toLowerCase());
  const hasRole = (role) => {
    const normalizedRole = String(role).trim().toLowerCase();
    if (normalizedRole === 'admin' && user?.isAdmin === true) return true;
    return roles.includes(normalizedRole);
  };
  const isTutor = hasRole('Tutor');
  const isStudent = hasRole('Student_Parent') || hasRole('Student');
  const isAdmin = hasRole('Admin') || user?.isAdmin === true;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        updateUser,
        isTutor,
        isStudent,
        isAdmin,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
