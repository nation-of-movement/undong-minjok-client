//templateStorageApi.js

import axios from '@/api/axios.js'

const BASE = '/templates/storage'

export default {
  //템플릿 보관함 조회
  getStorageList() {
    return axios.get(BASE)
  },

  //템플릿 보관함에 추가
  addToStorage(templateId) {
    return axios.post(`${BASE}/${templateId}`)
  },

  //템플릿 삭제
  deleteFromStorage(templateId) {
    return axios.delete(`${BASE}/${templateId}`)
  },

  //템플릿 적용
  applyTemplate(templateId, date) {
    return axios.post(`${BASE}/${templateId}/apply`, null, {
      params: {date}
    })
  },
}
