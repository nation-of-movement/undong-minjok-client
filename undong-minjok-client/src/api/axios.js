import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // HttpOnly refreshToken 쿠키 전송
  timeout: 10000
})

api.interceptors.request.use(
  (config) => {
    // 로그인/회원가입/리프레시 같은 곳에서만 skipAuth: true를 명시적으로 줄 것
    if (config.skipAuth) return config;

    const authStore = useAuthStore();

    // 새로고침 직후 대비: 메모리에 없으면 localStorage에서 복구
    if (!authStore.accessToken) {
      authStore.loadFromStorage();
    }

    const token = authStore.accessToken;

    if (token) {
      // headers 객체 보장
      config.headers = config.headers || {};

      // 이미 Authorization을 명시한 경우는 건들지 않음
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;

// 응답 인터셉터 (공통 에러 처리)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore();
    const originalRequest = error.config;

    if (!error.response) {
      alert("서버에 연결할 수 없습니다.\n잠시 후 다시 시도해주세요.");
      return Promise.reject(error);
    }


    const { status, data } = error.response;
    const url = originalRequest.url || '';

    if (data?.message) {
      error.customMessage = data.message;   // ⭐⭐ 이 메시지를 UI에서 사용 가능!
    }

    if (status === 500 || status === 503) {
      error.customMessage = "서비스 오류가 발생했습니다. 관리자에게 문의해주세요.";
      return Promise.reject(error);
    }

    // TODO: 401 응답 처리 및 토큰 재발급, 재시도, clearAuthState 호출 등 인터셉터 로직 작성

    // 401이 아닌 상황은 그대로 throw
    if(status !== 401) return Promise.reject(error);

    // auth 관련 엔드포인트의 401 무한 루프 방지를 위해 그대로 throw
    if(url.includes('/api/v1/auth/')) return Promise.reject(error);

    // access token이 없는 상황도 그대로 throw
    if(!authStore.accessToken) {
      authStore.clearAuthState();
      router.replace('/login');
      return Promise.reject(error);
    }

    // 이미 재시도한 요청이면 그대로 실패
    if(originalRequest._retry) return Promise.reject(error);

    // 일반 보호 API의 401 중 한 번만 refresh 시도
    if(isRefreshing) return Promise.reject(error);

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await authStore.refreshTokens();
      isRefreshing = false;

      // 401로 실패햇던 기존 요청을 다시 수행
      originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`;
      return api(originalRequest);
    } catch(e) {
      isRefreshing = false;
      authStore.clearAuthState();
      return Promise.reject(e);
    }
  },
);

export default api

//  템플릿 API 전용 함수
export const templateApi = {

  // 전체 조회 (정렬/검색 없음)
  getAll() {
    return api.get(`/templates/all`);
  },

  // 상세 조회
  getDetail(id) {
    return api.get(`/templates/${id}`);
  },

  // 추천하기
  recommend(id) {
    return api.post(`/templates/${id}/recommend`);
  },

  // 추천 취소
  unRecommend(id) {
    return api.delete(`/templates/${id}/recommend`);
  },

  // 구매하기
  purchase(id) {
    return api.post(`/templates/${id}/purchase`);
  },

  getPage({ page = 0, size = 10, name = "", sort = "LATEST" }) {
    return api.get(`/templates/paged`, {
      params: { page, size, name, sort }
    });
  },

  // 템플릿 수정 (JSON)
  updateTemplate(id, payload) {
    return api.patch(`/templates/${id}`, payload);
  },


  // 템플릿 삭제
  deleteTemplate(id) {
    return api.delete(`/templates/${id}`);
  },

  //  내 템플릿 구매 내역
  getMyPurchaseHistory() {
    return api.get(`/templates/purchases/me`);
  },

  //  내 템플릿 판매 내역
  getMySalesHistory() {
    return api.get(`/templates/sales/me`);
  }
};
