<template>
  <div class="find-container">
    <div class="find-card">

      <!-- 헤더 -->
      <div class="find-header">
        <h2 class="title">비밀번호 찾기</h2>
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
              :disabled="verifyStore.emailVerified"
              placeholder="이메일 입력"
            />

            <button
              type="button"
              class="btn-sub"
              :disabled="verifyStore.sending || verifyStore.emailVerified"
              @click="sendCode"
            >
              <!-- 길이 균등(밀림방지) -->
              <span v-if="verifyStore.emailVerified">재요청</span>
              <span v-else-if="verifyStore.sending">요청 중...</span>
              <span v-else>인증요청</span>
            </button>
          </div>

          <!-- 인증번호 입력 -->
          <div v-if="verifyStore.codeSent" class="verify-section">
            <label>인증번호</label>

            <div class="verify-row">
              <input
                v-model="code"
                :disabled="verifyStore.emailVerified"
                placeholder="인증번호 입력"
              />

              <button
                type="button"
                @click="checkCode"
                class="btn-sub"
                :disabled="verifyStore.emailVerified"
              >
                확인
              </button>
            </div>

            <!-- timer -->
            <p v-if="!verifyStore.emailVerified && verifyStore.timer > 0" class="timer">
              ⏳ {{ verifyStore.timer }}초 남음
            </p>

            <!-- 성공/실패 메시지 -->
            <p v-if="verifyStore.emailVerified" class="success">✔ 인증 완료!</p>
            <p v-if="verifyStore.verifyFail" class="error">❌ 인증 실패 또는 만료</p>
          </div>
        </div>

        <!-- 다음 단계 -->
        <button
          class="btn-red w-full big"
          :disabled="!verifyStore.emailVerified"
        >
          다음 단계로
        </button>

      </form>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePasswordSearchStore } from "@/stores/passwordSearchStore";

const router = useRouter();
const verifyStore = usePasswordSearchStore();

const email = ref("");
const code = ref("");

onMounted(() => {
  verifyStore.reset();
});

/* ---------------------------
 * 이메일 인증 요청
 * --------------------------- */
const sendCode = async () => {
  if (!email.value.trim()) return alert("이메일을 입력해주세요.");

  const ok = await verifyStore.sendCode(email.value);

  if (ok) alert("인증번호가 발송되었습니다.");
};

/* ---------------------------
 * 인증번호 확인
 * --------------------------- */
const checkCode = async () => {
  if (!code.value.trim()) return alert("인증번호를 입력해주세요.");

  const ok = await verifyStore.verifyCode(email.value, code.value);

  if (ok) alert("인증되었습니다.");
};

/* ---------------------------
 * 다음 단계 이동
 * --------------------------- */
const onSubmit = () => {
  if (!verifyStore.emailVerified) return;

  router.push({
    path: "/password/reset",
    query: { token: verifyStore.resetToken },
  });
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
  background: rgba(20,20,20,0.6);
  border: 1px solid rgba(255,255,255,0.15);
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
.back-btn:hover { color: #fff; }

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
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.15);
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
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.25);
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

.error { color: #ff4c4c; font-size: 12px; }
.success { color: #4cff4c; font-size: 12px; }

.btn-red {
  padding: 14px;
  background: #E60023;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}
.btn-red:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.w-full { width: 100%; }
.big { font-size: 16px; }
</style>
