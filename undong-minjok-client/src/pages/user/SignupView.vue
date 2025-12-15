<template>
  <div class="signup-container">
    <div class="signup-card">

      <!-- 헤더 + 뒤로가기 버튼 -->
      <div class="signup-header">
        <h2 class="title">회원가입</h2>
        <button class="back-btn" @click="router.back()">이전</button>
      </div>

      <p class="subtitle">운동의 민족에 오신 것을 환영합니다! 🏋️</p>

      <form @submit.prevent="onSubmit">

        <!-- 아이디 -->
        <div class="input-group">
          <label>아이디</label>
          <input v-model="loginId" @blur="validateLoginId" placeholder="아이디 입력" />
          <p v-if="loginId && idExists" class="error">이미 사용 중인 아이디입니다.</p>
          <p v-if="loginId && !idExists" class="success">사용 가능한 아이디입니다.</p>
        </div>

        <!-- 이름 -->
        <div class="input-group">
          <label>이름</label>
          <input v-model="name" placeholder="이름 입력" />
        </div>

        <!-- 닉네임 -->
        <div class="input-group">
          <label>닉네임</label>
          <input v-model="nickname" @blur="validateNickname" placeholder="닉네임 입력" />
          <p v-if="nickname && nickExists" class="error">이미 사용 중인 닉네임입니다.</p>
          <p v-if="nickname && !nickExists" class="success">사용 가능한 닉네임입니다.</p>
        </div>

        <!-- 이메일 -->
        <div class="input-group">
          <label>이메일</label>

          <div class="email-row">
            <input
              v-model="email"
              placeholder="이메일 입력"
              :disabled="emailVerify.sending || emailVerify.emailVerified"
            />

            <button
              type="button"
              @click="sendCode"
              class="btn-sub"
              :disabled="!emailValid || emailVerify.sending || emailVerify.emailVerified"
            >
              {{ emailVerify.emailVerified
              ? "인증완료"
              : emailVerify.sending
                ? "요청 중..."
                : emailVerify.codeSent
                  ? "재요청"
                  : "인증요청"
              }}
            </button>
          </div>
          <p v-if="email && !emailValid" class="error">올바른 이메일 형식이 아닙니다.</p>

          <!-- 인증번호 입력 -->
          <div v-if="emailVerify.codeSent" class="verify-section">
            <label>인증번호</label>
            <div class="verify-row">
              <input
                v-model="code"
                placeholder="인증번호 입력"
                :disabled="emailVerify.emailVerified"
              />

              <button
                type="button"
                @click="checkCode"
                class="btn-sub"
                :disabled="emailVerify.verifying || emailVerify.emailVerified"
              >
                {{ emailVerify.emailVerified
                ? "완료"
                : emailVerify.verifying
                  ? "확인 중..."
                  : "확인"
                }}
              </button>
            </div>

            <p class="timer" v-if="!emailVerify.emailVerified">
              ⏳ {{ emailVerify.timer }}초 남음
            </p>
            <p v-if="emailVerify.emailVerified" class="success">✔ 이메일 인증 완료!</p>
            <p v-if="emailVerify.verifyFail && !emailVerify.emailVerified" class="error">
              인증 실패 또는 만료되었습니다.
            </p>
          </div>
        </div>

        <!-- 비밀번호 -->
        <div class="input-group">
          <label>비밀번호</label>
          <input v-model="password" type="password" placeholder="비밀번호 입력" />
        </div>

        <!-- 회원가입 버튼 -->
        <button class="btn-red big w-full" :disabled="!formValid || auth.loading">
          {{ auth.loading ? "가입 중..." : "회원가입" }}
        </button>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useEmailVerifyStore } from "@/stores/emailVerifyStore";

const auth = useAuthStore();
const emailVerify = useEmailVerifyStore();
const router = useRouter();

const loginId = ref("");
const name = ref("");
const nickname = ref("");
const email = ref("");
const password = ref("");
const code = ref("");

const idExists = ref(false);
const nickExists = ref(false);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emailValid = computed(() => emailRegex.test(email.value));

// 아이디 중복 검사
const validateLoginId = async () => {
  if (!loginId.value.trim()) return;

  try {
    idExists.value = await auth.checkLoginId(loginId.value);
  } catch (e) {
    alert(e.customMessage || "아이디 확인 실패");
  }
};

// 닉네임 중복 검사
const validateNickname = async () => {
  if (!nickname.value.trim()) return;

  try {
    nickExists.value = await auth.checkNickname(nickname.value);
  } catch (e) {
    alert(e.customMessage || "닉네임 확인 실패");
  }
};

// 이메일 인증번호 요청
const sendCode = async () => {
  if (!email.value.trim()) return alert("이메일을 입력하세요.");

  try {
    await emailVerify.sendCode(email.value);
    alert("인증번호가 발송되었습니다.");
  } catch (e) {
    alert(e.customMessage || "이메일 발송 실패");
  }
};

// 인증번호 검증
const checkCode = async () => {
  if (!code.value.trim()) return alert("인증번호를 입력하세요.");

  try {
    const ok = await emailVerify.verifyCode(email.value, code.value);
    alert(ok ? "인증 성공!" : "인증 실패");
  } catch (e) {
    alert(e.customMessage || "인증 실패");
  }
};

// 전체 폼 유효성 검사
const formValid = computed(() => {
  return (
    loginId.value &&
    name.value &&
    nickname.value &&
    email.value &&
    password.value &&
    !idExists.value &&
    !nickExists.value &&
    emailVerify.emailVerified
  );
});

// 회원가입 요청
const onSubmit = async () => {
  if (!formValid.value) return alert("입력값을 확인해주세요.");

  try {
    const result = await auth.register({
      loginId: loginId.value,
      name: name.value,
      nickname: nickname.value,
      password: password.value,
      email: email.value,
    });

    if (!result.success) return alert(result.message);
    alert("회원가입 완료! 로그인해주세요.");
    router.push("/login");

  } catch (e) {
    alert(e.customMessage || "회원가입 실패");
  }
};

// 컴포넌트 제거 시 타이머 초기화
onUnmounted(() => {
  emailVerify.reset();
});
</script>

<style scoped>
/* 기존 CSS 그대로 유지 */
.signup-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.signup-card {
  width: 420px;
  padding: 40px;
  border-radius: 16px;
  background: rgba(20,20,20,0.6);
  border: 1px solid rgba(255,255,255,0.15);
  backdrop-filter: blur(8px);
  color: #fff;
}

.signup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  background: transparent;
  border: none;
  font-size: 14px;
  color: #bbb;
  cursor: pointer;
}
.back-btn:hover { color: #fff; }

.title {
  font-size: 28px;
  font-weight: 700;
}

.subtitle {
  font-size: 14px;
  opacity: 0.7;
  margin-bottom: 20px;
}

.input-group { margin-bottom: 20px; }
.input-group label { display: block; margin-bottom: 6px; }

.input-group input {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 8px;
  color: #fff;
}

.email-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-sub {
  height: 44px;
  padding: 0 12px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  white-space: nowrap;
}

.verify-section { margin-top: 12px; }
.verify-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.timer { color: #ccc; font-size: 12px; }

.error { color: #ff4c4c; font-size: 12px; }
.success { color: #4cff4c; font-size: 12px; }

.btn-red {
  padding: 14px;
  background: #E60023;
  border-radius: 8px;
  font-weight: 700;
  margin-top: 10px;
  cursor: pointer;
}
.btn-red:disabled { opacity: 0.4; }
</style>
