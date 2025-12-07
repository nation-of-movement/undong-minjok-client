import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';

import { loginApi, refreshApi, logoutApi } from '@/api/authApi';
import router from '@/router';

/*
  useAuthStore: 인증 전용 전역 상태 모듈
  - accessToken: 현재 로그인한 사용자의 Access Token
  - user: { username, role, ... } 형태의 사용자 정보
  - loading: 로그인/재발급 등 진행 여부
*/
export const useAuthStore = defineStore('auth', () => {
  // 1) state
  const accessToken = ref(null);   // 문자열 or null
  const user = ref(null);          // { username, role, ... } or null
  const loading = ref(false);

  // 2) getters (computed 로 정의)
  /*
    isLoggedIn:
    - accessToken 과 user 둘 다 존재할 때 "로그인 된 상태"로 본다.
  */
  const isLoggedIn = computed(
    () => !!accessToken.value && !!user.value
  );

  /*
    isAdmin:
    - user.role 이 'ADMIN' 또는 'ROLE_ADMIN' 이면 관리자라고 판단한다.
    - 백엔드에서 role 을 어떤 문자열로 주는지에 따라 분기 처리.
  */
  const isAdmin = computed(() => {
    const role = user.value?.role;
    return role === 'ADMIN' || role === 'ROLE_ADMIN';
  });

  /*
    username:
    - user 가 없으면 빈 문자열, 있으면 user.username 반환
  */
  const username = computed(
    () => user.value?.username || ''
  );

  // 3) 내부 유틸 함수들
  /*
    setAccessToken:
    - accessToken ref 를 갱신하고
    - localStorage 에도 함께 저장/삭제한다.
  */
  const setAccessToken = (token) => {
    accessToken.value = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  };

  /*
    setUser:
    - user ref 를 갱신하고
    - localStorage 에도 함께 저장/삭제한다.
  */
  const setUser = (userData) => {
    user.value = userData || null;
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  };

  /*
    setUserFromToken:
    - accessToken 문자열에서 JWT payload 를 파싱하여 username, role 을 추출해서 user 에 세팅한다.
    - jwt-decode 라이브러리 사용
      const payload = jwtDecode(token);
      payload.sub, payload.role 같은 식으로 값 접근.
  */
  const setUserFromToken = (token) => {
    try {
      const payload = jwtDecode(token);

      const userIdFromToken =
        payload.userId ??   // 보통 이렇게 넣어둔 경우가 많음
        payload.id ??       // 혹시 id 로 넣어둔 경우
        null;

      const usernameFromToken = payload.sub || payload.username;
      const roleFromToken = payload.role;
      if (!usernameFromToken || !roleFromToken) {
        setUser(null);
        return;
      }
      setUser({
        userId: userIdFromToken,
        username: usernameFromToken,
        role: roleFromToken,
      });
    } catch (e) {
      console.error('Failed to decode JWT', e);
      setUser(null);
    }
  };

  /*
    loadFromStorage:
    - 새로고침(F5) 후에도 로그인 상태를 유지하기 위해 localStorage 에 저장해 둔 값을 읽어와 ref 에 복원한다.
  */
  const loadFromStorage = () => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');

    if (token) {
      accessToken.value = token;
    }
    if (userStr) {
      try {
        user.value = JSON.parse(userStr);
      } catch {
        user.value = null;
      }
    }
  };

  /*
    clearAuthState:
    - refresh 토큰 재발급 실패 등 네트워크 요청 없이 프런트 쪽 인증 상태만 비우고 싶을 때 사용하는 함수.
    - accessToken, user, 에러/로딩 상태를 초기화하고, 로그인 페이지로 이동한다.
  */
  const clearAuthState = () => {
    setAccessToken(null);
    setUser(null);
    loading.value = false;
    router.push('/login');
  };

  // 4) actions (실제 동작 로직)
  /*
    login:
    - /api/v1/auth/login 을 호출해서 accessToken 을 받는다.
    - 성공 시:
        1) setAccessToken 로 토큰 저장
        2) setUserFromToken 으로 JWT payload 기반 user 세팅
    - 실패 시:
        errorMessage 를 반환하여 화면에서 표시할 수 있게 한다.
  */
  const login = async ({ loginId, password }) => {
    loading.value = true;

    try {
      const res = await loginApi(loginId, password)
      const { success, data, message } = res.data;
      if(!success) {
        return {
          success: false,
          message: message || '로그인에 실패했습니다.'
        }
      }

      setAccessToken(data.accessToken)
      setUserFromToken(data.accessToken)

      // /me 호출해서 userId 포함한 full user 정보로 덮어쓰기
      // await loadMyInfo()

      return { success : true }
    } catch(e) {
      return {
        success: false,
        message: e.response?.data?.message || '로그인 신청 중 오류가 발생했습니다.'
      }
    } finally {
      loading.value = false;
    }
  };

  /*
    refreshTokens:
    - /api/v1/auth/refresh 를 호출해서 새 accessToken 을 받는다.
    - HttpOnly 쿠키에 있는 refreshToken 을 서버가 읽어서 처리하는 구조.
    - 성공 시: accessToken 및 user (payload 기반) 갱신.
    - 실패 시: accessToken, user 를 비우고 에러를 던진다.
      (실제 clearAuthState 호출은 인터셉터에서 수행)
  */
  const refreshTokens = async () => {

    try {
      const res = await refreshApi()
      const { success, data, message } = res.data;
      if(!success) {
        throw new Error(message || '토큰 재발급 실패')
      }
      setAccessToken(data.accessToken)
      setUserFromToken(data.accessToken)
      // await loadMyInfo()
    } catch(e) {
      setAccessToken(null)
      setUser(null)
      throw e;
    }
  };

  /*
    logout:
    - /api/v1/auth/logout 을 호출해서 서버 측에서 refreshToken 을 무효화한다.
    - 서버 요청 성공/실패와 상관 없이 클라이언트의 accessToken, user, 에러/로딩 상태를 모두 초기화하고 로그인 페이지로 이동한다.
  */
  const logout = async () => {
  };

  // 내 정보 불러오기 (/users/me)
  const loadMyInfo = async () => {
    if (!accessToken.value) return

    try {
      const dto = await fetchMyInfoApi()

      // 백엔드 DTO가 어떤 이름을 쓰는지에 맞춰서 매핑
      const resolvedUserId =
        dto.userId ?? // 이미 userId 라고 내려오면 사용
        dto.id ??     // 혹시 id 로 내려오면 사용
        dto.memberId ?? // memberId 같은 이름일 수도 있음
        null

      const resolvedUsername =
        dto.userLoginId ??  // 이런 이름이면 사용
        dto.loginId ??      // 지금 로그에 찍힌 필드
        dto.username ??     // 혹시 username 이라면
        ''

      const resolvedRole =
        dto.role ??
        dto.userRole ??
        (Array.isArray(dto.authorities) ? dto.authorities[0]?.authority : undefined) ??
        null

      setUser({
        ...dto,              // 원래 내려온 모든 필드 유지
        userId: resolvedUserId,
        username: resolvedUsername,
        role: resolvedRole,
      })
    } catch (e) {
      const status = e.response?.status

      if (status === 401) {
        console.warn('loadMyInfo: 401 → 토큰 무효, 상태 초기화')
        clearAuthState()
        return
      }

      console.error('loadMyInfo 에러', e)
      setUser(null)
    }
  }

  // userId가 없으면 /auth/me 를 한 번 호출해서 채우는 헬퍼
  const ensureUserId = async () => {
    // 이미 userId 있으면 그대로 반환
    if (user.value?.userId) {
      return user.value.userId;
    }

    // 토큰 없으면 여기서 끝
    if (!accessToken.value) {
      return null;
    }

    try {

      //  알림 서비스의 /api/auth/me 호출
      const dto = await fetchNotificationAuthMe();

      const resolvedUserId =
        dto.userId ??
        dto.id ??
        dto.memberId ??
        null;

      const resolvedUsername =
        dto.username ??
        dto.loginId ??    // 혹시 이렇게 내려오면
        user.value?.username ??
        '';

      const resolvedRole =
        dto.role ??
        dto.userRole ??
        user.value?.role ??
        null;

      // 기존 user 정보(닉네임, 이메일 등)는 가능한 한 유지하면서 userId만 보충
      setUser({
        ...(user.value || {}),
        userId: resolvedUserId,
        username: resolvedUsername,
        role: resolvedRole,
      });

      return resolvedUserId;
    } catch (e) {
      return null;
    }
  };


  // 5) 외부로 공개할 state / getters / actions 반환
  return {
    accessToken,
    user,
    loading,
    isLoggedIn,
    isAdmin,
    username,
    setAccessToken,
    setUser,
    setUserFromToken,
    loadFromStorage,
    clearAuthState,
    login,
    refreshTokens,
    logout,
    loadMyInfo,
    ensureUserId,
  };
});
