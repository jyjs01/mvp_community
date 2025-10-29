import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// 요청: 토큰 자동 첨부
api.interceptors.request.use(async (config) => {
  const at = await SecureStore.getItemAsync('accessToken');
  if (at) config.headers.Authorization = `Bearer ${at}`;
  return config;
});

// 응답 에러 메시지 안전 추출
export function extractMessage(error) {
  if (error?.response?.data) {
    const d = error.response.data;
    return d.message || d.error || d.msg || '';
  }
  return error?.message || '';
}

export default api;
