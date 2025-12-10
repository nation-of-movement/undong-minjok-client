// partsApi.js
import axios from "@/api/axios.js";

export default {
  getParts() {
    return axios.get("/parts");
  }
};
