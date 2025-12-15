export const POINT_STATS_TAG = {
  RECHARGE : { type: 'recharge',label: '충전완료', contents : '포인트 충전'}
  , PURCHASE : { type: 'purchase',label: '구매완료', contents : '템플릿 구매'}
  , EARN : { type: 'earn',label: '판매완료', contents : '템플릿 판매'}
  , WITHDRAW_WAIT : { type: 'withdraw-wait',label: '출금 대기중', contents: '포인트 출금'}
  , WITHDRAW : { type: 'withdraw',label: '출금완료' , contents: '포인트 출금'}
}

export const KOREA_BANK_LIST = {
  KB: { type: 'KB', label: '국민은행', code: '004' },
  SHINHAN: { type: 'SHINHAN', label: '신한은행', code: '088' },
  WOORI: { type: 'WOORI', label: '우리은행', code: '020' },
  HANA: { type: 'HANA', label: '하나은행', code: '081' },
  NH: { type: 'NH', label: '농협은행', code: '011' },
  KEB: { type: 'KEB', label: '외환은행(구 KEB)', code: '005' },
  IBK: { type: 'IBK', label: '기업은행', code: '003' },
  KDB: { type: 'KDB', label: '산업은행', code: '002' },
  SC: { type: 'SC', label: 'SC제일은행', code: '023' },
  CITI: { type: 'CITI', label: '씨티은행', code: '027' },
  KAKAO: { type: 'KAKAO', label: '카카오뱅크', code: '090' },
  TOSS: { type: 'TOSS', label: '토스뱅크', code: '092' },
  SUHYUP: { type: 'SUHYUP', label: '수협은행', code: '007' },
  GWANGJU: { type: 'GWANGJU', label: '광주은행', code: '034' },
  DAEGU: { type: 'DAEGU', label: '대구은행', code: '031' },
  BUSAN: { type: 'BUSAN', label: '부산은행', code: '032' },
  JEONBUK: { type: 'JEONBUK', label: '전북은행', code: '037' },
  JEJU: { type: 'JEJU', label: '제주은행', code: '035' }
}

export const PAYMENT_METHOD = {
  CARD: { type: 'CARD', label: '카드결제' },
  BANK_TRANSFER: { type: 'BANK_TRANSFER', label: '계좌이체' },
  EASY_PAY: { type: 'EASY_PAY', label: '간편결제' },
  POINT: { type: 'POINT', label: '포인트 결제' },
  MOBILE: { type: 'MOBILE', label: '휴대폰 결제' }
}
