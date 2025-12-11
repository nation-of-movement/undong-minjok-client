<template>
  <div class="block">
    <h3>💰포인트 충전</h3>

    <div class="card">
      <input
        type="number"
        class="input-large"
        min="0"
        v-model.number="amount.value"
        placeholder="충전할 금액을 입력해주세요."
      />
      <div class="btn-card">
        <button @click="addAmount(0)">초기화</button>
        <button @click="addAmount(1000)">+1,000원</button>
        <button @click="addAmount(5000)">+5,000원</button>
        <button @click="addAmount(10000)">+10,000원</button>
      </div>
    </div>

    <!-- 결제하기 버튼 -->
    <div class="div-btn">
      <button :disabled="!ready" @click="requestPayment" class="button payments-btn" style="margin-top: 30px">
        결제하기
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { loadTossPayments } from "@tosspayments/tosspayments-sdk"
const tossPayments = await loadTossPayments(clientKey);
// 랜덤 문자열 생성
function generateRandomString() {
  return window.btoa(Math.random().toString()).slice(0, 20)
}


// TODO: clientKey는 개발자센터 결제위젯 연동 키로 교체
const clientKey = 'test_ck_LlDJaYngroa7b9vy92zm3ezGdRpX'
const customerKey = generateRandomString()
loadTossPayments(clientKey).then((tossPayments) => {

  console.log( "#### " , tossPayments);

});

// 상태 정의
const amount = reactive({
  currency: 'KRW',
  value: 0,
})

//
const addAmount = (price) => {
  if (price <= 0) {
    amount.value = 0
    return
  }

  amount.value += price;
  console.log(amount.value);
}


// 결제 요청 전 금액확인
function checkAmount() {
  if (amount.value <= 0) {
    alert('금액을 다시 확인해주세요.')
    return
  }

  alert("결제");
  // 결제요청
  requestPayment()
}

/*async function setAmount() {
  console.log("setAmount");
  await widgets.value.setAmount({
    currency: 'KRW',
    value: amount.value,
  })
}*/

// 결제 요청
async function requestPayment() {
  if (!widgets.value || !ready.value) return

  let orderId = generateRandomString();

  await payment.requestPayment({
        method: "CARD", // 카드 결제
        amount: {
          currency: "KRW",
          value: 50000,
        },
        orderId: "8SjcU9Kdpq6hNC3WdqhzD", // 고유 주문번호
        orderName: "토스 티셔츠 외 2건",
        successUrl: window.location.origin + "/success", // 결제 요청이 성공하면 리다이렉트되는 URL
        failUrl: window.location.origin + "/fail", // 결제 요청이 실패하면 리다이렉트되는 URL
        customerEmail: "customer123@gmail.com",
        customerName: "김토스",
        customerMobilePhone: "01012341234",
        // 카드 결제에 필요한 정보
        card: {
          useEscrow: false,
          flowMode: "DEFAULT", // 통합결제창 여는 옵션
          useCardPoint: false,
          useAppCardOnly: false,
        },
  });
}

/*
watch(
  () => amount.value,
  async () => {
    await setAmount();
  }
)
*/

// 마운트 시 위젯 초기화
onMounted(async () => {
 // await setAmount()

})
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
  justify-content: center; /* 가로 중앙 */
  width: 100%;
}


</style>
