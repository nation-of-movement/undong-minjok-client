<template>
  <div class="page-wrapper">

    <h1>{{ date }} 운동 기록장</h1>

    <div class="record-wrapper">

      <!-- 좌측 테이블 -->
      <div class="table-box">
        <table>
          <thead>
          <tr>
            <th>운동명</th>
            <th>부위</th>
            <th>횟수</th>
            <th>중량</th>
            <th>시간</th>
            <th>기구</th>
            <th>삭제</th>
          </tr>
          </thead>

          <tbody>
          <tr v-for="(row, idx) in rows" :key="idx">
            <td><input v-model="row.exerciseName" /></td>
            <td><input v-model="row.part" /></td>

            <td><input type="number" v-model.number="row.reps" /></td>
            <td><input type="number" v-model.number="row.weight" /></td>
            <td><input type="number" v-model.number="row.duration" /></td>

            <td>
              <input
                class="equipment-input"
                readonly
                placeholder="기구 선택"
                v-model="row.equipmentName"
                @click="openModal(idx)"
              />
            </td>

            <td>
              <button class="delete-btn" @click="deleteRow(idx)">×</button>
            </td>
          </tr>
          </tbody>
        </table>

        <button class="add-row-btn" @click="addRow()">+ 행 추가</button>
      </div>

      <!-- 이미지 업로드 -->
      <div class="img-box">
        <div class="preview">
          <img v-if="previewImg" :src="previewImg" />
          <span v-else>사진 업로드</span>
        </div>

        <input type="file" @change="onImageSelect" />
      </div>

    </div>

    <button class="save-btn" @click="saveRecord">저장하기</button>

    <!-- 기구 검색 모달 -->
    <div class="modal-bg" v-show="modalOpen" @click.self="closeModal">
      <div class="modal">
        <div class="modal-title">부위 입력 → 운동기구 추천</div>

        <input class="search-input" v-model="partKeyword" placeholder="예: 가슴, 어깨, 등">

        <div>
          <div
            class="equipment-item"
            v-for="item in filteredEquipments"
            :key="item"
            @click="selectEquipment(item)"
          >
            {{ item }}
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import DailyWorkoutRecordApi from "@/api/DailyWorkoutRecordApi"

export default {
  name: "RecordPage",

  data() {
    return {
      date: this.$route.query.date,

      recordId: null,
      previewImg: null,

      rows: [],

      modalOpen: false,
      partKeyword: "",
      modalRowIndex: null,

      EQUIPMENTS: {
        가슴: ["벤치프레스 머신", "덤벨", "펙덱 플라이", "푸쉬업바"],
        등: ["랫풀다운", "바벨", "케이블 로우", "풀업바"],
        어깨: ["덤벨", "숄더프레스 머신", "케이블"],
        하체: ["스쿼트랙", "레그프레스", "레그익스텐션"],
        팔: ["EZ바", "덤벨", "케이블"],
        전신: ["케틀벨", "바벨", "덤벨"],
      },
    };
  },

  computed: {
    filteredEquipments() {
      if (!this.partKeyword) return [];
      const key = Object.keys(this.EQUIPMENTS).find(k => k.includes(this.partKeyword));
      return key ? this.EQUIPMENTS[key] : [];
    },
  },

  async created() {
    await this.initRecord();
  },

  methods: {
    async initRecord() {
      const res = await DailyWorkoutRecordApi.initRecord(this.date);
      this.recordId = res.data.recordId;

      if (!res.data.isNew) {
        await this.loadExistingRecord();
      }
    },

    async loadExistingRecord() {
      const res = await DailyWorkoutRecordApi.getRecord(this.date);
      const data = res.data;

      // 이미지 절대 경로로 변환
      if (data.workoutImg) {
        this.previewImg = `http://localhost:8888/uploads/${data.workoutImg}`;
        console.log("이미지 URL:", this.previewImg);

      }

      this.rows = data.exercises.map(e => ({
        exerciseName: e.exerciseName,
        part: e.exercisePart,  // 정상 매핑
        reps: e.reps,
        weight: e.weight,
        duration: e.duration,
        equipmentName: e.equipmentName ?? "",
        equipmentId: null,
      }));
    },

    addRow() {
      this.rows.push({
        exerciseName: "",
        part: "",
        reps: null,
        weight: null,
        duration: null,
        equipmentName: "",
        equipmentId: null,
      });
    },

    deleteRow(idx) {
      this.rows.splice(idx, 1);
    },

    async onImageSelect(e) {
      const file = e.target.files[0];
      if (!file) return;

      this.previewImg = URL.createObjectURL(file);

      await DailyWorkoutRecordApi.uploadImage(this.date, file);
    },

    openModal(index) {
      this.modalRowIndex = index;
      this.partKeyword = "";
      this.modalOpen = true;
    },
    closeModal() {
      this.modalOpen = false;
    },
    selectEquipment(eq) {
      this.rows[this.modalRowIndex].equipmentName = eq;
      this.closeModal();
    },

    async saveRecord() {
      const payload = {
        date: this.date,
        exercises: this.rows.map((r, i) => ({
          exerciseName: r.exerciseName,
          part: r.part,
          reps: r.reps,
          weight: r.weight,
          duration: r.duration,
          equipmentId: null, // TODO: 기구 ID 매핑 시 변경
          orderIndex: i,
        })),
      };

      await DailyWorkoutRecordApi.saveRecord(payload);
      alert("저장 완료!");
    },
  },
};
</script>

<style scoped>
.page-wrapper {
  padding: 40px;
  background: #F4F4F4;
  min-height: 100vh;
  box-sizing: border-box;
}

h1 {
  font-size: 30px;
  font-weight: 700;
  margin-bottom: 25px;
}

.record-wrapper {
  display: grid;
  grid-template-columns: 1.6fr 0.9fr;
  gap: 30px;
}

.table-box {
  background: #fff;
  padding: 25px;
  border-radius: 16px;
  border: 1px solid #ddd;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th {
  padding: 12px;
  background: #fafafa;
  border-bottom: 1px solid #e5e5e5;
  font-size: 14px;
  color: #444;
}

td {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

td input {
  width: 100%;
  padding: 8px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  color: #222;
  text-align: center;
  font-size: 14px;
}

td input.equipment-input {
  cursor: pointer;
  background: #fafafa;
}

td input:focus {
  border-color: #E60023;
  box-shadow: 0 0 6px rgba(230, 0, 35, 0.4);
  outline: none;
}

.delete-btn {
  background: transparent;
  border: none;
  color: #E60023;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
}

.add-row-btn {
  margin-top: 14px;
  padding: 12px 22px;
  background: #E60023;
  border: none;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.img-box {
  background: #fff;
  padding: 25px;
  border-radius: 16px;
  border: 1px solid #ddd;
  text-align: center;
}

.preview {
  width: 100%;
  height: 330px;
  border-radius: 12px;
  border: 1px dashed #bbb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  overflow: hidden;
  margin-bottom: 15px;
  background: #fafafa;
}

.preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-bg {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.35);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: #fff;
  padding: 24px;
  width: 360px;
  border-radius: 12px;
  animation: fadeIn 0.25s ease;
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 16px;
}

.equipment-item {
  padding: 12px;
  background: #f7f7f7;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  border: 1px solid #ddd;
}

.equipment-item:hover {
  background: #E60023;
  color: #fff;
  border-color: #E60023;
}
</style>
