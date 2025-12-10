<template>
  <div class="find-container">
    <div class="find-card">

      <div class="find-header">
        <h2 class="title">아이디 찾기</h2>
        <button class="back-btn" @click="router.back()">이전</button>
      </div>

      <p class="subtitle">가입하신 이메일로 인증번호를 보내드립니다.</p>

      <form @submit.prevent="onSubmit">

        <!-- 이메일 -->
        <div class="input-group">
          <label>이메일</label>

          <div class="email-row">
            <input
              v-model="email"
              :disabled="verify.emailVerified"
              placeholder="이메일 입력"
            />

            <button
              type="button"
              class="btn-sub"
              :disabled="verify.sending || verify.emailVerified"
              @click="sendCode"
            >
              <span v-if="verify.sending">요청 중...</span>
              <span v-else>인증요청</span>
            </button>
          </div>

          <!-- 인증번호 입력 -->
          <div v-if="verify.codeSent" class="verify-section">
            <label>인증번호</label>

            <div class="verify-row">
              <input
                v-model="code"
                :disabled="verify.emailVerified"
                placeholder="인증번호 입력"
              />

              <button
                type="button"
                class="btn-sub"
                :disabled="verify.emailVerified"
                @click="checkCode"
              >
                확인
              </button>
            </div>

            <p v-if="!verify.emailVerified && verify.timer > 0" class="timer">
              ⏳ {{ verify.timer }}초 남음
            </p>

            <p v-if="verify.emailVerified" class="success">✔ 인증 완료!</p>
            <p v-if="verify.verifyFail" class="error">❌ 인증 실패 또는 만료</p>
          </div>
        </div>

        <!-- 인증 완료 후 아이디 표시 -->
        <p v-if="foundId" class="found-id">
          📌 회원님의 아이디는
          <strong>{{ foundId }}</strong> 입니다.
        </p>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePasswordSearchStore } from "@/stores/passwordSearchStore";
import { findIdApi } from "@/api/authApi";

const router = useRouter();
const verify = usePasswordSearchStore();

const email = ref("");
const code = ref("");
const foundId = ref(null);

onMounted(() => {
  verify.reset();
});

/* 이메일 인증 요청 */
const sendCode = async () => {
  if (!email.value.trim()) return alert("이메일을 입력해주세요.");

  const ok = await verify.sendCode(email.value);
  if (ok) alert("인증번호가 발송되었습니다.");
};

/* 인증번호 확인 */
const checkCode = async () => {
  if (!code.value.trim()) return alert("인증번호를 입력해주세요.");

  const ok = await verify.verifyCode(email.value, code.value);

  if (ok) {
    alert("인증되었습니다.");
    fetchUserId();
  }
};

/* 아이디 가져오기 */
const fetchUserId = async () => {
  const res = await findIdApi(verify.resetToken);

  if (res.success) {
    foundId.value = res.data;
  } else {
    alert("아이디 찾기에 실패했습니다.");
  }
};
</script>

<style scoped>
.find-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.find-card {
  width: 420px;
  padding: 40px;
  border-radius: 16px;
  background: rgba(20, 20, 20, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  backdrop-filter: blur(8px);
}

.find-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  background: transparent;
  border: none;
  color: #bbb;
  cursor: pointer;
}
.back-btn:hover {
  color: #fff;
}

.title {
  font-size: 26px;
  font-weight: 700;
}

.subtitle {
  opacity: 0.7;
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  margin-bottom: 6px;
  display: block;
}

.input-group input {
  flex: 1;
  height: 44px;
  padding: 0 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #fff;
}

.email-row,
.verify-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-sub {
  height: 44px;
  padding: 0 14px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  cursor: pointer;
  color: #fff;
  white-space: nowrap;
}

.btn-sub:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.verify-section {
  margin-top: 12px;
}

.timer {
  font-size: 12px;
  color: #ccc;
}

.error {
  color: #ff4c4c;
  font-size: 12px;
}

.success {
  color: #4cff4c;
  font-size: 12px;
}

.found-id {
  font-size: 16px;
  margin-top: 20px;
  color: #fff;
}

.found-id strong {
  color: #4cff4c;
}
</style>
