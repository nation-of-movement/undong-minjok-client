import axios from '@/api/axios.js'

const BASE = '/records'

export default {

  //날짜 진입 시 기록 초기화 (isNew 여부 확인)
  initRecord(date) {
    return axios.post(`${BASE}/${date}/init`)
  },

  //해당 날짜 기록 조회
  getRecord(date) {
    return axios.get(`${BASE}`, {
      params: { date }
    })
  },

  //기록 저장
  saveRecord(payload) {
    return axios.post(`${BASE}`, payload)
  },

  //운동 이미지 업로드
  uploadImage(date, file) {
    const form = new FormData()
    form.append('file', file)

    return axios.post(`${BASE}/${date}/image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  //월별 사진 조회
  getMonthlyPhotos(year, month) {
    return axios.get(`${BASE}/photos`, {
      params: { year, month }
    })
  }
}
