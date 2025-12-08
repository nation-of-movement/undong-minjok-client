<template>
  <div class="reset-container">
    <div class="reset-card">

      <!-- 헤더 -->
      <div class="reset-header">
        <h2 class="title">비밀번호 재설정</h2>
        <button class="back-btn" @click="router.push('/login')">로그인</button>
      </div>

      <p class="subtitle">새로운 비밀번호를 입력해주세요.</p>

      <form @submit.prevent="submit">

        <!-- 새 비밀번호 -->
        <div class="input-group">
          <label>새 비밀번호</label>
          <input
            type="password"
            v-model="password"
            placeholder="새 비밀번호 입력"
          />
        </div>

        <!-- 비밀번호 확인 -->
        <div class="input-group">
          <label>비밀번호 확인</label>
          <input
            type="password"
            v-model="passwordCheck"
            placeholder="비밀번호 확인"
          />
          <p v-if="passwordCheck && password !== passwordCheck" class="error">
            비밀번호가 일치하지 않습니다.
          </p>
        </div>

        <!-- 변경 버튼 -->
        <button
          class="btn-red w-full big"
          :disabled="!canSubmit || loading"
        >
          {{ loading ? "변경 중..." : "변경하기" }}
        </button>

      </form>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { resetPasswordApi } from "@/api/authApi";

const route = useRoute();
const router = useRouter();

const resetToken = route.query.token;

const password = ref("");
const passwordCheck = ref("");
const loading = ref(false);

// 제출 조건
const canSubmit = computed(() => {
  return (
    password.value &&
    password.value.length >= 6 &&
    password.value === passwordCheck.value
  );
});

// 서버 요청
const submit = async () => {
  if (!canSubmit.value) return;

  loading.value = true;

  try {
    await resetPasswordApi(resetToken, password.value);

    alert("비밀번호가 성공적으로 변경되었습니다.");
    router.push("/login");
  } catch (e) {
    alert(e.response?.data?.message || "변경 실패");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.reset-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.reset-card {
  width: 420px;
  padding: 40px;
  border-radius: 16px;
  background: rgba(20,20,20,0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.15);
  color: #fff;
}

.reset-header {
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
  margin-bottom: 20px;
  opacity: 0.7;
}

.input-group {
  margin-bottom: 20px;
}

.input-group input {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 8px;
  color: #fff;
}

.error {
  font-size: 12px;
  color: #ff4c4c;
  margin-top: 4px;
}

.btn-red {
  width: 100%;
  padding: 14px;
  background: #E60023;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  text-align: center;
}

.btn-red:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.big {
  font-size: 16px;
}
</style>
