import api from './axios.js';

export async function loginApi(loginId, password) {
  alert(loginId);
  alert(password);
  return api.post('/auth/login', { loginId, password })
}

export function refreshApi() {
  return api.post('/auth/token-reissue',
    {},
    { skipAuth : true } // request interceptor에게 "Authorization" 속성을 붙이지 않도록 알림
  );
}

export function logoutApi() {
  return api.post('/auth/logout');
}

export function registerApi(payload) {
  // 회원가입
  return api.post('/auth/signUp', payload);
}
