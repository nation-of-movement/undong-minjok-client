<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'
import { paymentsApi } from '@/api/paymentsApi.js'

const router = useRouter();
const route = useRoute();
const orderId = route.query.orderId;  // 주문 id
const paymentKey = route.query.paymentKey; // key
const amount = route.query.amount; // 그액
console.log(route);

async function comfirm() {

  let payload = {
    orderId : orderId,
    paymentKey : paymentKey,
    amount : amount
  }

  try {

    await paymentsApi(payload);

  } catch(e) {
    console.log(e)
  }

}



</script>

<template>
  <div class="block">
    <h1>✅</h1>
    <h3>결제가 완료되었습니다.</h3>

    <div class="payment-info-div">
      <span>결제 : </span>
      <span>토스 페이</span>
    </div>
    <div class="payment-info-div">
      <span>포인트 금액 : </span>
      <span>{{ route.query.amount }}원</span>
    </div>


    <button>확인</button>
  </div>
</template>

<style scoped>
.block {
  display: flex;
  flex-direction: column;
  align-items: center; /* 가로 중앙 */
  justify-content: center; /* 세로 중앙 */
  height: 700px; /* 화면 전체 높이 */
  width: 700px; /* 원하는 폭 */
  margin: 0 auto; /* 혹시 flex 안 쓰는 경우 가로 중앙 */
  background-color: white;
  padding: 60px;
  border-radius: 12px;
  box-sizing: border-box;
}

.payment-info-div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 250px;
}

button {
  margin-top: 40px;
  height: 40px;
  width: 300px;
  background-color: red;
  border-radius: 5px;
  border: 1px;
  color: white;
}
</style>
