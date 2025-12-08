import api from './axios.js';

// 결제 승인 api
export async function paymentsApi(payload) {
  return api.post('/v1/payments/confirm', payload);
}

// 결제 승인시 redis 임시 저장
export async function paymentsPrepareApi(payload) {
  return api.post('/v1/payments/prepare', payload);
}
