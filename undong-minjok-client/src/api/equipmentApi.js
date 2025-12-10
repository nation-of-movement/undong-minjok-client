// equipmentApi.js

import axios from '@/api/axios.js'

export default {
  getEquipmentsByPart(partId) {
    return axios.get('/equipments', {
      params: { part: partId },
    });
  },
};
