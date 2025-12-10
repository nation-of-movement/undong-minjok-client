export const POINT_STATS_TAG = {
  RECHARGE : { type: 'recharge',label: '충전완료', contents : '포인트 충전'}
  , PURCHASE : { type: 'purchase',label: '구매완료', contents : '템플릿 구매'}
  , EARN : { type: 'earn',label: '적립완료', contents : '템플릿 판매'}
  , WITHDRAW_WAIT : { type: 'withdraw-wait',label: '출금 대기중', contents: '포인트 출금'}
  , WITHDRAW : { type: 'withdraw',label: '출금완료' , contents: '포인트 출금'}
}

export const KOREA_BANK_LIST = {
  KB: { type: 'kb', label: '국민은행', code: '004' },
  SHINHAN: { type: 'shinhan', label: '신한은행', code: '088' },
  WOORI: { type: 'woori', label: '우리은행', code: '020' },
  HANA: { type: 'hana', label: '하나은행', code: '081' },
  NH: { type: 'nh', label: '농협은행', code: '011' },
  KEB: { type: 'keb', label: '외환은행(구 KEB)', code: '005' },
  IBK: { type: 'ibk', label: '기업은행', code: '003' },
  KDB: { type: 'kdb', label: '산업은행', code: '002' },
  SC: { type: 'sc', label: 'SC제일은행', code: '023' },
  CITI: { type: 'citi', label: '씨티은행', code: '027' },
  KAKAO: { type: 'kakao', label: '카카오뱅크', code: '090' },
  TOSS: { type: 'toss', label: '토스뱅크', code: '092' },
  SUHYUP: { type: 'suhyup', label: '수협은행', code: '007' },
  GWANGJU: { type: 'gwangju', label: '광주은행', code: '034' },
  DAEGU: { type: 'daegu', label: '대구은행', code: '031' },
  BUSAN: { type: 'busan', label: '부산은행', code: '032' },
  JEONBUK: { type: 'jeonbuk', label: '전북은행', code: '037' },
  JEJU: { type: 'jeju', label: '제주은행', code: '035' }
}
