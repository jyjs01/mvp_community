import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { API } from '@lib/api';

const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser]   = useState(null);
  const [loading, setLoading] = useState(true);


  // 앱 시작 시 토큰 로드
  useEffect(() => {
    (async () => {
      const t = await SecureStore.getItemAsync('token');
      if (t) {
        setToken(t);
        try {
          const me = await API.request('/auth/me', { token: t });
          setUser(me.user);
        } catch {
          await SecureStore.deleteItemAsync('token');
          setToken(null);
        }
      }
      setLoading(false);
    })();
  }, []);


  // 로그인
  const signIn = async ({ email, password }) => {
    const { user, token } = await API.request('/auth/login', {
      method: 'POST',
      json: { email, password },
    });
    setUser(user);
    setToken(token);
    await SecureStore.setItemAsync('token', token);
    return user;
  };


  // 회원가입
  const signUp = async ({ name, email, password }) => {
    await API.request('/auth/register', {
      method: 'POST',
      json: { name, email, password },
    });
    
    // 회원가입 후 바로 로그인 처리
    return signIn({ email, password });
  };


  // 로그아웃
  const signOut = async () => {
    setUser(null);
    setToken(null);
    await SecureStore.deleteItemAsync('token');
  };


  const value = useMemo(() => ({ user, token, loading, signIn, signUp, signOut }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
