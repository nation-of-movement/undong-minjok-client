import api from './axios.js';

// 포인트 이력 조회
export async function fetchPointHistory(status) {
  return api.get('/points', {
    params: { pointStatus : status}
  });
}

// 출금 api
export async function withdrawApi(payload) {
  return api.post('/points/refund', {
    point: payload.point,
    bank: payload.bank,
    accountNumber: payload.accountNumber
  });
}


// 포인트 상세 조회
export async function fetchPointHistoryDetail(id) {
  return api.get(`/points/detail/${id}`);
}
