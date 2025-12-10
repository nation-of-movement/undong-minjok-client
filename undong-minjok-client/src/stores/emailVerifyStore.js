import { defineStore } from 'pinia';
import { ref } from 'vue';
import { sendEmailCodeApi, verifyEmailCodeApi } from '@/api/authApi';

export const useEmailVerifyStore = defineStore('emailVerify', () => {

  const codeSent = ref(false);       // 인증 요청됨
  const emailVerified = ref(false);  // 인증 성공
  const verifyFail = ref(false);     // 인증 실패
  const timer = ref(0);

  const sending = ref(false);        // 인증요청 중
  const verifying = ref(false);      // 인증번호 검증 중
  let timerInterval = null;

  /* ----------------------------
   * 타이머 시작 (300초)
   * ---------------------------- */
  const startTimer = () => {
    timer.value = 300;

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      timer.value--;

      if (timer.value <= 0) {
        clearInterval(timerInterval);
        emailVerified.value = false;
        verifyFail.value = true;
      }
    }, 1000);
  };

  /* ----------------------------
   * 인증번호 발송
   * ---------------------------- */
  const sendCode = async (email) => {

    if (sending.value) {
      alert("이미 요청 중입니다.");
      return;
    }

    sending.value = true;

    try {
      await sendEmailCodeApi({
        email,
        purpose: 'SIGNUP',
      });

      codeSent.value = true;
      verifyFail.value = false;
      emailVerified.value = false;
      startTimer();

      return true;

    } catch (e) {
      throw e;
    } finally {
      sending.value = false;
    }
  };

  /* ----------------------------
   * 인증번호 검증
   * ---------------------------- */
  const verifyCode = async (email, code) => {
    if (verifying.value) return;
    verifying.value = true;

    try {
      const res = await verifyEmailCodeApi({
        email,
        code,
        purpose: 'SIGNUP',
      });

      const ok = res.data?.data?.success;

      if (ok) {
        emailVerified.value = true;
        verifyFail.value = false;
        clearInterval(timerInterval);
        return true;
      }

      emailVerified.value = false;
      verifyFail.value = true;
      return false;

    } catch (e) {
      emailVerified.value = false;
      verifyFail.value = true;
      throw e;
    } finally {
      verifying.value = false;
    }
  };

  /* ----------------------------
   * 초기화
   * ---------------------------- */
  const reset = () => {
    codeSent.value = false;
    emailVerified.value = false;
    verifyFail.value = false;
    timer.value = 0;
    sending.value = false;
    verifying.value = false;

    if (timerInterval) clearInterval(timerInterval);
  };

  return {
    codeSent,
    emailVerified,
    verifyFail,
    timer,
    sending,
    verifying,

    sendCode,
    verifyCode,
    reset,
  };
});
