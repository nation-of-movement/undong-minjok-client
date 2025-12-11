<script setup>
import { useRoute, useRouter } from 'vue-router'
import { onMounted, reactive, ref } from 'vue'
import { paymentsConfirmApi } from '@/api/paymentsApi.js'

const router = useRouter();
const route = useRoute();
const pageType = ref(false)
const orderId = route.query.orderId;  // 주문 id
const paymentKey = route.query.paymentKey; // key
const amount = route.query.amount; // 그액
const paymentInfo = reactive({
  amount: 0,
  method : '',
  status : '',
  date : ''
})

// 확인 btn
const closeBtn = () => {
  router.push({ path: '/'});
}

// 결제 승인
async function confirm() {
  let payload = {
    orderId: orderId,
    paymentKey: paymentKey,
    amount: amount,
  }
  try {
    return await paymentsConfirmApi(payload)

  } catch (e) {
    console.log(e)

  }
}

onMounted(async () => {
   const response = await confirm();
   console.log(response);

   if (response.data.success) {
     pageType.value = 'success';
     const data = response.data.data;
     console.log(data);
     paymentInfo.date = data.createdDt
     paymentInfo.amount = data.amount;
     paymentInfo.status = data.status;
     paymentInfo.method = data.method;
   }

   console.log( pageType.value);
})
</script>

<template>
  <div class="block" v-if="pageType.value == 'success'">
      <h1>✅</h1>
      <h3>결제가 완료되었습니다.</h3>
    <div class="card">
      <div class="payment-info-div">
        <span>결제 수단: </span>
        <span>{{ paymentInfo.method }}</span>
      </div>
      <div class="payment-info-div">
        <span>포인트 금액 : </span>
        <span>{{ paymentInfo.amount }}원</span>
      </div>
      <div class="payment-info-div">
        <span>결제일 : </span>
        <span>{{ paymentInfo.date.split('T')[0] }}</span>
      </div>
    </div>


    <button @click="closeBtn">확인</button>
  </div>

  <div v-else-if="pageType.value == 'fail'">
    <h1>결제에 실패했습니다.</h1>
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

.card {
  padding: 50px;
}
.payment-info-div {

  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 400px;
}

button {
  margin-top: 40px;
  height: 40px;
  width: 60px;
  background-color: red;
  border-radius: 5px;
  border: 1px;
  color: white;
}


</style>
