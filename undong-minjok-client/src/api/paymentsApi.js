import api from './axios.js';


// 결제 승인시 redis 임시 저장
export async function paymentsPrepareApi(payload) {
  return api.post('/payments/prepare', payload);
}

// 결제 승인 api
export async function paymentsConfirmApi(payload) {
  return api.post('/payments/confirm', payload);
}

