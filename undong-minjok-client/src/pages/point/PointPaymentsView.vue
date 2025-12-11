<template>
  <div class="block">
    <h3>💰포인트 충전</h3>

    <div class="card">
      <input
        type="number"
        class="input-large"
        min="100"
        v-model.number="amount"
        placeholder="충전할 금액을 입력해주세요."
      />
      <div class="btn-card">
        <button @click="addAmount(0)">초기화</button>
        <button @click="addAmount(1000)">+1,000원</button>
        <button @click="addAmount(5000)">+5,000원</button>
        <button @click="addAmount(10000)">+10,000원</button>
      </div>
    </div>

    <div class="wrapper">
      <div class="box_section">
        <div class="div-btn">
          <button
            :disabled="!ready"
            @click="checkAmount"
            class="button payments-btn"
            style="margin-top: 30px"
          >
            결제하기
          </button>
          <span @click="closePayment">취소</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { paymentsPrepareApi } from '../../api/paymentsApi.js'
import { useRouter } from 'vue-router'

// Toss 클라이언트 키
const clientKey = 'test_ck_LlDJaYngroa7b9vy92zm3ezGdRpX'
const router = useRouter();
// 상태 변수
const amount = ref(0)
const paymentReady = ref(false)
const tossPaymentsInstance = ref(null)

const closePayment = () => {
  router.push('/profile');
}

// Toss SDK 로더 (수정된 완전 버전)
const loadTossPaymentsSDK = (clientKey) => {
  return new Promise((resolve, reject) => {
    // 이미 로드되어 있다면 바로 초기화
    if (window.TossPayments) {
      try {
        return resolve(window.TossPayments(clientKey))
      } catch (e) {
        return reject(e)
      }
    }

    // script 로딩
    const script = document.createElement('script')
    script.src = 'https://js.tosspayments.com/v1/payment'
    script.async = true

    script.onload = () => {
      if (window.TossPayments) {
        try {
          resolve(window.TossPayments(clientKey))
        } catch (e) {
          reject(new Error('TossPayments 초기화 실패: ' + e.message))
        }
      } else {
        reject(new Error('TossPayments SDK 로드됐지만 전역객체 없음'))
      }
    }

    script.onerror = () => reject(new Error('TossPayments SDK 스크립트 로드 실패'))
    document.head.appendChild(script)
  })
}

// 주문번호 생성
function generateRandomString() {
  return window.btoa(Math.random().toString()).slice(0, 20)
}

// 금액 버튼
const addAmount = (price) => {
  if (price <= 0) amount.value = 0
  else amount.value += price
}

// SDK 로드
onMounted(async () => {
  try {
    tossPaymentsInstance.value = await loadTossPaymentsSDK(clientKey)
    paymentReady.value = true
    console.log('TossPayments SDK 로드 완료')
  } catch (err) {
    console.error(err)
    alert('결제 모듈 로딩에 실패했어요! 다시 시도해주세요.')
  }
})

// 버튼 활성화 조건
const ready = computed(() => {
  return amount.value >= 100 && paymentReady.value
})

// 결제 버튼 클릭 시
function checkAmount() {
  if (amount.value < 100) {
    alert("100원 이상 입력해주세요.")
    return
  }
  requestPayment()
}

// 결제 요청
async function requestPayment() {
  if (!tossPaymentsInstance.value) {
   //  alert("SDK 로드 대기 중입니다.")
    return
  }

  const orderId = generateRandomString();

  let payload = {
    orderId : orderId,
    amount : amount.value,
    paymentId : paymentReady.value,
  }

  try {

    // 레디스 저장
    await paymentsPrepareApi(payload);

    // 토스 결제
    await tossPaymentsInstance.value.requestPayment('CARD', {
      amount: amount.value,
      orderId,
      orderName: `포인트 충전 ${amount.value}원`,
      customerName: '김토스',
      customerEmail: 'lala19873@naver.com',
      successUrl: window.location.origin + '/success',
      failUrl: window.location.origin + '/fail',
    })
  } catch (err) {
    console.error('결제 요청 실패:', err)
    await router.push('/');

  }
}
</script>


<style scoped>
body,
html {
  height: 100%;
  margin: 0;
}
.block {
  display: flex;
  flex-direction: column;
  align-items: center; /* 가로 중앙 */
  justify-content: center; /* 세로 중앙 */
  min-height: 100vh; /* 화면 전체 높이 */
  width: 700px; /* 원하는 폭 */
  margin: 0 auto; /* 혹시 flex 안 쓰는 경우 가로 중앙 */
  background-color: white;
  padding: 50px;
  border-radius: 12px;
  box-sizing: border-box;
}

.card {
  width: 400px; /* 카드 폭 고정 */
  display: flex;
  flex-direction: column;
  align-items: center; /* 카드 중앙 정렬 */
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-sizing: border-box;
}

.btn-card {
  display: flex;
  justify-content: flex-end; /* 오른쪽 정렬 */
  margin-top: 10px;
  gap: 10px; /* 버튼 간격 */
}

.btn-card button {
  height: 30px;
  background-color: white;
  border-radius: 5px;
  border: 1px solid #e60023;
}
.wrapper {
  width: 500px;
}
.input-large {
  width: 470px; /* 부모 .card 폭에 맞춤 */
  height: 40px;
  border-radius: 10px;
  border: 1px solid #ccc;
  padding: 0 10px;
  outline: none;
  box-sizing: border-box;
  text-align: right;
}

input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}

.payments-btn {
  height: 40px;
  width: 300px;
  background-color: red;
  border-radius: 5px;
  border: 1px;
  color: white;
}

.div-btn {
  display: flex;
  flex-direction: column; /* ← 세로 정렬 핵심 */
  justify-content: center; /* 세로 기준 중앙 정렬 */
  align-items: center;     /* 가로 기준 중앙 정렬 */
  width: 100%;
}

.div-btn span {
  padding-top: 10px;
  font-size: 12px;
}
</style>
