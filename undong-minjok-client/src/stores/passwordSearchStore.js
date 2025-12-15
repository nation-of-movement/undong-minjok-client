import { defineStore } from 'pinia';
import { ref } from 'vue';
import { sendEmailCodeApi, verifyEmailCodeApi } from '@/api/authApi';

export const usePasswordSearchStore = defineStore('passwordSearch', () => {
  const sending = ref(false);
  const codeSent = ref(false);
  const emailVerified = ref(false);
  const verifyFail = ref(false);
  const timer = ref(0);
  const resetToken = ref(null);
  const purpose = ref("PASSWORD_SEARCH");
  const code = ref("");

  let timerInterval = null;

  const startFlow = (p) => {
    purpose.value = p;
    reset();
  };

  /* -------------------------
   * 초기화 (페이지 진입 시 호출)
   * ------------------------- */
  const reset = () => {
    sending.value = false;
    codeSent.value = false;
    emailVerified.value = false;
    verifyFail.value = false;
    timer.value = 0;
    resetToken.value = null;

    if (timerInterval) clearInterval(timerInterval);
  };

  /* -------------------------
   * 타이머 시작 (300초)
   * ------------------------- */
  const startTimer = () => {
    timer.value = 300;
    verifyFail.value = false;

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      timer.value--;

      if (timer.value <= 0) {
        clearInterval(timerInterval);
        verifyFail.value = true;
      }
    }, 1000);
  };

  /* -------------------------
   * 인증번호 이메일 발송
   * ------------------------- */
  const sendCode = async (email) => {
    sending.value = true;

    try {
      await sendEmailCodeApi({
        email,
        purpose: purpose.value,
      });

      codeSent.value = true;
      emailVerified.value = false;
      resetToken.value = null;

      startTimer();
      return true;
    } catch (e) {
      return false;
    } finally {
      sending.value = false;
    }
  };

  /* -------------------------
   * 인증번호 검증
   * ------------------------- */
  const verifyCode = async (email, code) => {
    try {
      const res = await verifyEmailCodeApi({
        email,
        code,
        purpose: purpose.value,
      });

      const success = res.data?.data?.success;
      const token = res.data?.data?.resetToken;

      if (success) {
        emailVerified.value = true;
        verifyFail.value = false;
        resetToken.value = token;

        clearInterval(timerInterval); // ⛔ 인증 성공 → 타이머 종료
        timer.value = 0; // 화면에서도 사라짐
        return true;
      }

      emailVerified.value = false;
      verifyFail.value = true;
      return false;

    } catch {
      emailVerified.value = false;
      verifyFail.value = true;
      return false;
    }
  };

  return {
    sending,
    codeSent,
    emailVerified,
    verifyFail,
    timer,
    resetToken,

    startFlow,
    sendCode,
    verifyCode,
    reset,
  };
});
