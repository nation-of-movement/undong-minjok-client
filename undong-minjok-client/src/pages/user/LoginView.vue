<template>
  <div class="login-container">

    <div class="login-card">
      <h2 class="title">로그인</h2>
      <p class="subtitle">다시 운동하러 돌아오셨군요 💪</p>

      <form @submit.prevent="onSubmit">

        <div class="input-group">
          <label>아이디</label>
          <input type="text" v-model="loginId" placeholder="아이디를 입력하세요" />
        </div>

        <div class="input-group">
          <label>비밀번호</label>
          <input type="password" v-model="password" placeholder="비밀번호를 입력하세요" />
        </div>

        <button class="btn-login" :disabled="auth.loading">
          {{ auth.loading ? "로그인 중..." : "로그인" }}
        </button>

        <div class="extra-links">
          <div class="left-links">
            <RouterLink to="/signup">회원가입</RouterLink>
          </div>

          <div class="right-links">
            <RouterLink to="/id/search">아이디 찾기</RouterLink>
            <RouterLink to="/password/search">비밀번호 찾기</RouterLink>
          </div>

        </div>

      </form>
    </div>

  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

const loginId = ref("");
const password = ref("");

const auth = useAuthStore();
const router = useRouter();

const onSubmit = async () => {
  if (!loginId.value || !password.value) {
    alert("아이디와 비밀번호를 입력해주세요.");
    return;
  }

  const result = await auth.login({
    loginId: loginId.value,
    password: password.value,
  });

  if (!result.success) {
    alert(result.message || "로그인에 실패했습니다.");
    return;
  }

  // 로그인 성공 → 홈으로 이동
  router.push("/");
};
</script>
<style scoped>
/* 전체 배경 */
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url('https://images.unsplash.com/photo-1599058917212-d750089bc07c?auto=format&fit=crop&w=1400&q=80')
  center/cover no-repeat;
  position: relative;
}

/* 어두운 오버레이 */
.login-container::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
}

/* 카드 */
.login-card {
  position: relative;
  z-index: 10;
  width: 380px;
  padding: 40px;
  border-radius: 16px;
  backdrop-filter: blur(12px);
  background: rgba(20, 20, 20, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.15);
  text-align: center;
  color: white;
  animation: fadeIn 0.5s ease-out;
}

/* 제목 */
.title {
  font-size: 28px;
  font-weight: 700;
}

.subtitle {
  font-size: 14px;
  opacity: 0.75;
  margin-top: 6px;
  margin-bottom: 24px;
}

/* 입력 그룹 */
.input-group {
  text-align: left;
  margin-bottom: 18px;
}

.input-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  opacity: 0.8;
}

.input-group input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.18);
  background: rgba(255,255,255,0.05);
  color: #fff;
  transition: 0.2s;
  box-sizing: border-box;
}

.input-group input:focus {
  border-color: #E60023;
  outline: none;
  background: rgba(255,255,255,0.1);
}

/* 버튼 */
.btn-login {
  width: 100%;
  padding: 14px;
  background: #E60023;
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  border-radius: 8px;
  margin-top: 10px;
  cursor: pointer;
  transition: 0.25s;
}

.btn-login:hover {
  background: #ff1137;
  transform: translateY(-2px);
}

/* 링크 */
.extra-links {
  margin-top: 18px;
  display: flex;
  justify-content: space-between; /* 양쪽 끝 정렬 */
  align-items: center;
  font-size: 14px;
  opacity: 0.7;
}

/* 왼쪽 영역 */
.left-links a {
  color: #fff;
  text-decoration: none;
}

/* 오른쪽 영역 */
.right-links {
  display: flex;
  gap: 14px; /* 아이디/비번 찾기 간격 */
}

.right-links a {
  color: #fff;
  text-decoration: none;
}

.extra-links a:hover {
  color: #E60023;
}


.extra-links a {
  color: #fff;
  text-decoration: none;
}

.extra-links a:hover {
  color: #E60023;
}

/* 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
