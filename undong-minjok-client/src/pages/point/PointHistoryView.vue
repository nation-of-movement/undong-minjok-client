<script setup>
import { onMounted, reactive, readonly, ref, watch } from 'vue'
import { fetchPointHistory, fetchPointHistoryDetail, withdrawApi } from '@/api/pointApi.js'
import { POINT_STATS_TAG, KOREA_BANK_LIST , PAYMENT_METHOD} from '@/pages/point/pointTag.js'
import './pointTagCss.css'
import {formatNumberWithCommas} from './util.js'
const pointHistory = ref([]) // 포인트 히스토리 내역
const pointStatus = ref([]) // 포인트 상태 리스트
const selectStatus = ref('') // 구분 값 (select)
const _totalPoint = ref(0)
const totalPoint = readonly(_totalPoint)
const _sellingPoint = ref(0)
const sellingPoint = readonly(_sellingPoint)

// 모달
const detailLabel = ref('포인트')
const detailUnit = ref('P')
const isModalOpen = ref(false)
const isDetailModalOpen = ref(false)
const feeCharge = ref(0)
const withdrawInfo = reactive({
  amount: 0,
  bank: '',
  accountNumber: '',
})

const detailInfo = reactive({
  accountNumber: '',
  amount: 0,
  bank: '',
  createdDt: '',
  method: '',
  pointStatus: '',
  templateName: '',
})

const onInput = (e) => {
  const value = e.target.value.replace(/[^0-9]/g, '');
  withdrawInfo.amount = value ? Number(value) : 0;
};

function formatDate(dateString) {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}.${month}.${day} ${hours}:${minutes}`;
}


const controlBodyScroll = () => {
  // 두 모달 중 하나라도 열려 있으면 true
  const isAnyModalOpen = isModalOpen.value || isDetailModalOpen.value;

  if (isAnyModalOpen) {
    // 모달이 열리면 배경 스크롤 숨김
    document.body.style.overflow = 'hidden';
  } else {
    // 모달이 모두 닫히면 스크롤 복원
    document.body.style.overflow = '';
  }
};

const openModal = () => {
  // 초기화
  withdrawInfo.accountNumber = ''
  withdrawInfo.bank = ''
  withdrawInfo.amount = 0
  controlBodyScroll();
  isModalOpen.value = true
}

watch(isModalOpen, controlBodyScroll);
watch(isDetailModalOpen, controlBodyScroll);
const closeModal = () => {
  isModalOpen.value = false
  isDetailModalOpen.value = false

}


const loadPointHistory = async (status) => {
  try {
    const response = await fetchPointHistory(status)
    return response.data.data
  } catch (e) {
    console.error(e)
  }
}

const withdraw = async () => {
  let payload = {
    point: withdrawInfo.amount,
    bank: withdrawInfo.bank,
    accountNumber: withdrawInfo.accountNumber,
  }

  try {
    const response = await withdrawApi(payload)
    if (response.data.success) {
      alert('출금되었습니다.')
      closeModal()
    }
  } catch (e) {
    console.error(e)
    closeModal()
    alert('포인트 출금 실패했습니다.')
  } finally {
    const result = await loadPointHistory()
    if (result) {
      pointHistory.value = result.points
      pointStatus.value = result.pointStatuses
      _totalPoint.value = result.totalPoint == null ? 0 : result.totalPoint
      _sellingPoint.value = result.sellingPoint == null ? 0 : result.sellingPoint
    }
  }
}

const onWithdraw = () => {

  if (withdrawInfo.amount <= 0) {
    alert('출금 포인트를 입력해주세요.')
    return
  }

  if (withdrawInfo.bank == '') {
    alert('은행을 선택해주세요.')
    return
  }
  if (!withdrawInfo.accountNumber || withdrawInfo.accountNumber.length < 9) {
    alert('계좌번호를 다시 확인해주세요.')
    return
  }

  // 출금 api
  withdraw()
}

onMounted(async () => {
  const result = await loadPointHistory()
  if (result) {
    pointHistory.value = result.points
    pointStatus.value = result.pointStatuses
    _totalPoint.value = result.totalPoint == null ? 0 : result.totalPoint
    _sellingPoint.value = result.sellingPoint == null ? 0 : result.sellingPoint
  }
})

// select 선택시 포인트 스토리 가져오기
watch(
  selectStatus,
  async (value) => {
    const result = await loadPointHistory(value)

    if (result) {
      pointHistory.value = result.points
      pointStatus.value = result.pointStatuses
    }
  },
  { immediate: true },
)

const addAmount = (price) => {
  if (price <= 0) {
    withdrawInfo.amount = 0
    return
  }

  withdrawInfo.amount += price
}

watch(
  () => withdrawInfo.amount,
  (newVal) => {
    let num = 0.5
    feeCharge.value = newVal * (num / 100)

    if (newVal > totalPoint.value) {
      withdrawInfo.amount = totalPoint.value
    }
  },
)
/*
watch(() => withdrawInfo.bank, (v) => {
  ("선택된 은행:", v)
})*/

// 마스킹
const maskAccountNumber = (accountNumber) => {
  const PREFIX_LEN = 3;
  const SUFFIX_LEN = 3;

  if (!accountNumber || accountNumber.length < 0) {
    return;
  }

  const totalLength = accountNumber.length;
  const maskLength = totalLength - PREFIX_LEN - SUFFIX_LEN;
  const maskedStars = '*'.repeat(maskLength);
  const prefix = accountNumber.slice(0, PREFIX_LEN);
  const suffix = accountNumber.slice(-SUFFIX_LEN);
  return prefix + maskedStars + suffix;

}

// 포인트 내역 상세
const goPointHistoryDetail = async (pointId) => {
  isDetailModalOpen.value = true

  // detail 가져오기
  try {
    const response = await fetchPointHistoryDetail(pointId)
    const data = response.data.data.pointDetailDTO

    detailInfo.accountNumber = maskAccountNumber(data.accountNumber)
    detailInfo.amount = data.amount ;
    detailInfo.bank = data.bank ? KOREA_BANK_LIST[data.bank].label : null;
    detailInfo.createdDt = formatDate(data.createdDt);
    detailInfo.method = data.paymentMethod
    detailInfo.pointStatus = data.pointStatus
    detailInfo.templdateName = data.templateName
    detailInfo.totalPoint = response.data.data.totalPoint

    detailLabel.value = detailInfo.pointStatus === 'RECHARGE' ? '결제금액' : '포인트'
    detailUnit.value = detailInfo.pointStatus === 'RECHARGE' ? '원' : 'P'
  } catch (e) {
    console.error(e)
  }
}
</script>

<template>
  <div class="block">
    <div class="point-block">
      <div class="point-sub-block">
        <span>마이 포인트 </span>
        <span>{{ formatNumberWithCommas(totalPoint) }}P</span>
      </div>
      <div class="point-btn-block">
        <router-link to="/point-charge"><button class="btn-red">충전</button></router-link>
        <button class="btn-white" @click="openModal">출금</button>
      </div>
    </div>
    <div class="point-sub-block">
      <span class="red-font">판매 포인트 </span>
      <span class="red-font">{{ formatNumberWithCommas(sellingPoint) }}P</span>
    </div>
  </div>

  <hr class="custom-hr" />

  <div class="select-block">
    <select class="select-box" v-model="selectStatus">
      <option value="">전체</option>
      <option v-for="(item, index) in pointStatus" :key="index" :value="item.status">
        {{ item.name }}
      </option>
    </select>
  </div>

  <template v-if="pointHistory.length > 0">
    <div class="point-history-block" v-for="(item, index) in pointHistory" :key="item.id || index">
      <div class="status-tag-block">
        <div :class="POINT_STATS_TAG[item.pointStatus]?.type">
          <span>{{ POINT_STATS_TAG[item.pointStatus]?.label }}</span>
        </div>
      </div>

      <div class="info-block" @click="goPointHistoryDetail(item.pointId)">
        <div class="info-block-title">{{ POINT_STATS_TAG[item.pointStatus]?.contents }}</div>
        <div v-if="item.templateName">{{ item.templateName }}</div>
        <span class="info-block-date">{{ item.createdDt.split('T')[0] }}</span>
      </div>
      <div class="point-block">
        <span>{{ formatNumberWithCommas(item.amount) ?? 0 }}</span>
      </div>
    </div>
  </template>

  <template v-else>
    <div class="empty-block">
      <span>조회된 이력이 없습니다.</span>
    </div>
  </template>

  <div v-if="isModalOpen" class="modal-overlay">
    <div class="modal-block">
      <div class="modal-header">
        <h3>포인트 출금</h3>
      </div>
      <div class="modal-contents">
        <div class="modal-point">
          <div>
            <span><strong> 출금금액</strong></span>
          </div>
          <div>
            <span>마이 포인트: </span>
            <span class="red-font">{{ formatNumberWithCommas(totalPoint) ?? 0 }}</span>
            <span> P</span>
          </div>
        </div>
        <div class="card">

          <input
            type="text"
            class="input-large"
            :value="formatNumberWithCommas(withdrawInfo.amount)"
            @input="onInput"
            placeholder="출금할 금액을 입력해주세요."
          />
          <div class="bottom-card">
            <div class="fee-info-text">
              <span>수수료 금액 : </span>
              <span>{{ formatNumberWithCommas(feeCharge) }}원 / {{ formatNumberWithCommas(withdrawInfo.amount - feeCharge) }}</span>
            </div>
            <div class="btn-card">
              <button @click="addAmount(0)">초기화</button>
              <button @click="addAmount(1000)">+1,000원</button>
              <button @click="addAmount(5000)">+5,000원</button>
              <button @click="addAmount(10000)">+10,000원</button>
            </div>
          </div>
        </div>
        <div class="fee-text">
          <span><strong>포인트 출금 수수료는 0.5%입니다.</strong></span>
        </div>
        <div class="modal-bank">
          <div>
            <span><strong>출금 계좌</strong></span>
          </div>
          <div class="madal-bank-select">
            <span><strong>은행</strong></span>
            <select v-model="withdrawInfo.bank">
              <option value="">전체</option>
              <option v-for="(item, index) in KOREA_BANK_LIST" :key="index" :value="item.type">
                {{ item.label }}
              </option>
            </select>
          </div>
          <div class="madal-bank-input">
            <span><strong>계좌번호</strong></span>
            <input
              type="text"
              maxlength="14"
              @input="withdrawInfo.accountNumber = withdrawInfo.accountNumber.replace(/\D/g, '')"
              v-model="withdrawInfo.accountNumber"
              placeholder="계좌번호를 입력해주세요."
            />
          </div>
        </div>
      </div>
      <div class="modal-btn">
        <button @click="closeModal" class="btn-white">취소</button>
        <button class="btn-red" @click="onWithdraw">출금</button>
      </div>
    </div>
  </div>

  <div v-if="isDetailModalOpen" class="modal-overlay">
    <div class="modal-block">
      <div class="detail-modal-header">
        <sapn class="font-gray">{{ detailInfo.createdDt }}</sapn>
        <h3 v-if="POINT_STATS_TAG[detailInfo.pointStatus]">
          {{ POINT_STATS_TAG[detailInfo.pointStatus].contents }}
        </h3>
      </div>
      <div class="detail-modal-contents">
        <div :class="POINT_STATS_TAG[detailInfo.pointStatus].type" v-if="POINT_STATS_TAG[detailInfo.pointStatus]">
          {{ POINT_STATS_TAG[detailInfo.pointStatus].label }}
        </div>

        <div class="detail-contents">
          <div class="detail-between">
            <span>{{ detailLabel }}</span>
            <span>{{ formatNumberWithCommas(detailInfo.amount) }} {{ detailUnit }}</span>
          </div>
        </div>
        <div class="detail-contents"  v-if="detailInfo.pointStatus != 'EARN'">
          <div class="detail-between">
            <span>결제 수단</span>
            <span>{{ detailInfo.method }}</span>
          </div>
          <div v-if="PAYMENT_METHOD[detailInfo.method] && PAYMENT_METHOD[detailInfo.method].type == 'BANK_TRANSFER'">
            <div class="detail-between">
              <span>은행</span>
              <span>{{ detailInfo.bank == null ? null : detailInfo.bank }}</span>
            </div>
            <div class="detail-between">
              <span>계좌이체</span>
              <span>{{ detailInfo.accountNumber == null ? null : detailInfo.accountNumber }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-btn">
        <button @click="closeModal" class="btn-white">확인</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.block {
}

.custom-hr {
  border: none;
  height: 2px;
  background-color: #777777;
  margin: 40px 0;
}
.point-block {
  display: flex;
  justify-content: space-between;
}
.point-sub-block {
  width: 50%;
  display: flex;
  justify-content: space-between;
  gap: 100px;

}

.point-sub-block .red-font {
  color: red;
  font-weight: bold;
}

.btn-red {
  padding: 8px 16px;
  background: #e60023;
  border-radius: 6px;
  font-weight: 600;
}

.btn-white {
  padding: 8px 16px;
  background: #ffffff;
  border-radius: 6px;
  font-weight: 600;
}

.select-block {
  width: 100%;
  display: flex;
  justify-content: end;
}
.select-box {
  width: 140px; /* select 박스 넓이 */
  position: relative;
  border-radius: 6px;
  padding: 10px 40px 10px 12px;
}

.point-history-block {
  width: 100%;
  display: flex;
  height: 70px;
  padding-top: 10px;
  padding-bottom: 10px;
}

.point-history-block .status-tag-block {
  width: 20%;
  display: flex;
  justify-content: center;
  padding-top: 10px;
}

.point-history-block .info-block {
  width: 65%;
}

.point-history-block .info-block-title {
  font-size: 18px;
  font-weight: bold;
  padding: 3px;
}

.point-history-block .info-block-date {
  font-size: 14px;
  color: #b5b5b5;
}

.point-history-block .point-block {
  width: 15%;
  padding: 5px 40px 0 40px;
}

.empty-block {
  width: 100%;
  display: flex; /* flex 컨테이너 */
  justify-content: center; /* 가로 중앙 */
  align-items: center; /* 세로 중앙 */
  height: 70px; /* point-history-block 높이와 맞춤 */
  color: #999;
  font-size: 16px;
  padding-top: 30px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4); /* 반투명 배경 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #000000;
  border-radius: 12px;
  width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.2s ease-out;
}

.modal-block .modal-header {
  width: 100%;
  text-align: left;
}
.modal-block .modal-header font-gray {
  padding: 10px;
}

.modal-block .modal-header h3 {
  padding: 15px;
}

.modal-block .modal-contents {
  width: 100%;
  //background-color: #11c46b;
}

.modal-block .modal-btn {
  display: flex;
  justify-content: center; /* 중앙 정렬 */
  align-items: center;
  gap: 12px; /* 버튼 간 간격 */
  margin-top: 20px;
  margin-bottom: 20px;
}

.modal-block .modal-contents .modal-point {
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
}

.red-font {
  color: #ff4c4c;
  font-weight: bold;
}

.input-large {
  width: 460px; /* 부모 .card 폭에 맞춤 */
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
.card {
  display: flex;
  flex-direction: column;
  padding: 5px 20px;
}

.btn-card {
  /*  background-color: #11c46b;*/
  width: 460px;
  display: flex;
  justify-content: end;
  padding-top: 5px;
  gap: 10px; /* 버튼 간격 */
}

.btn-card button {
  height: 30px;
  background-color: white;
  border-radius: 5px;
  border: 1px solid #e60023;
}
.modal-bank {
  width: 100px;
  padding: 40px 20px;
}
.madal-bank-select {
  width: 460px;
  /*  background-color: #777777;*/
  padding-top: 10px;
  padding-bottom: 10px;
}

.madal-bank-select select {
  width: 140px; /* select 박스 넓이 */
  position: relative;
  border-radius: 6px;
  padding: 10px 40px 10px 12px;
  margin-left: 45px;
}

.madal-bank-input {
  width: 460px;
  display: flex;
  justify-content: start;
  align-items: center;
  /* background-color: #777777;*/
}

.madal-bank-input input {
  width: 250px;
  padding: 10px 40px 10px 12px;
  border-radius: 5px;
  margin-left: 15px;
  border: 1px;
}

.fee-text {
  font-size: 10px;
  color: #ff4c4c;
  text-align: right;
  padding-right: 20px;
}

.fee-info-text {
  width: 50%;
  font-size: 10px;
  display: flex;
  justify-content: start;
  align-items: center;
}

.bottom-card {
  /*  background-color: #ff4c4c;*/
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.detail-modal-header {
  width: 500px;
  display: flex;
  flex-direction: column; /* 세로로 쌓기 */
  justify-content: center; /* 세로 중앙 정렬 */
  align-items: flex-start; /* 왼쪽 정렬 */
  color: white; /* 글자색은 필요시 */
}
.detail-modal-header .font-gray {
  padding-top: 50px;
  padding-left: 24px;
  font-size: 13px;
  color: #f0f0f0;
}
.detail-modal-header h3 {
  font-size: 20px;
  padding-left: 22px;
  margin: 0;
}
.detail-modal-contents {
  width: 100%;
  padding: 30px 10px 30px 80px;
}
.detail-contents {
  width: 440px;
  padding-top: 20px;
}

.detail-between {
  width: 400px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
</style>
