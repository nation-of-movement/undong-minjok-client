<script setup>
import { useRoute, useRouter } from 'vue-router'
import { onMounted, reactive, ref } from 'vue'
import { paymentsConfirmApi } from '@/api/paymentsApi.js'

const router = useRouter();
const route = useRoute();
const pageType = ref('loading')
const orderId = route.query.orderId;  // 주문 id
const paymentKey = route.query.paymentKey; // key
const amount = route.query.amount; // 그액
const paymentInfo = reactive({
  amount: 0,
  method : '',
  status : '',
  date : ''
})

const fromPath = localStorage.getItem('fromPath');
const closeBtn = () => {
  router.push({ path: `${fromPath}` });
  localStorage.removeItem('fromPath');
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
    console.error('결제 실패:', e)

  }
}

onMounted(async () => {
   const response = await confirm();

   if (response.data.success) {
     pageType.value = 'success';
     const data = response.data.data;

     paymentInfo.date = data.createdDt
     paymentInfo.amount = data.amount;
     paymentInfo.status = data.status;
     paymentInfo.method = data.method;
   }

})
</script>

<template>
  <div class="container">
    <div class="block">
      <div v-if="pageType == 'success'">
        <div class="block-header">
          <h1>✅</h1>
          <h3>결제 완료되었습니다.</h3>
        </div>
        <div class="block-contents">
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
      </div>

      <div v-else-if="pageType == 'fail'">
        <div class="block-header">
          <h1>❎</h1>
          <h3>결제 실패했습니다.</h3>
        </div>
      </div>
      <div v-else-if="pageType == 'loading'">
        <div class="block-loading">
            <img src="../../assets/icon/loading.gif" alt="loading"  width="50px"/>
        </div>
      </div>

      <div class="block-btn" v-if="pageType != 'loading'">
        <button @click="closeBtn" class="closeBtn">확인</button>
      </div>
    </div>
  </div>
</template>

<style scoped>

.container {
  width: 800px;
  margin: auto;
}

.block {
  position: relative;
  background: #0a0a0a;
  width: 800px;
  height: 500px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
}

.block-header {
  padding-top: 100px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.block-btn {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 20px;
}

.block-contents {
  width: 100%;
  padding : 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.payment-info-div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 400px;
}

.block-btn button {
  width: 80px;
  padding: 8px 14px;
  background: #0f0f0f;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  font-size: 15px;
  cursor: pointer;
}

.block-loading {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.7;
  position: absolute;
  inset: 0
}




</style>
