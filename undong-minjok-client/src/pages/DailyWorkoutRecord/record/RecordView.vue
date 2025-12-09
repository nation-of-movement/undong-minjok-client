<template>
  <RecordHeaderBar />
  <div class="page-wrapper">
    <h1 class="page-title">{{ date }} 오늘도 성장하는 중 🔥</h1>
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
        <div class="preview" @click="triggerFileSelect">
          <img v-if="previewImg" :src="previewImg" />
          <span v-else>📸 사진 업로드 (클릭)</span>
        </div>

        <!-- 숨겨진 실제 파일 업로드 input -->
        <input
          type="file"
          ref="fileInput"
          class="hidden-file-input"
          @change="onImageSelect"
        />
      </div>
    </div>

    <button class="save-btn" @click="saveRecord">저장하기</button>

    <!-- 🔥 기구 검색 모달 (백엔드 기반으로 변경됨)-->
    <div class="modal-bg" v-show="modalOpen" @click.self="closeModal">
      <div class="modal">

        <!-- ⭐ Step 1: 부위 선택 -->
        <div v-if="!selectedPartId">
          <div class="modal-title">운동 부위를 선택해주세요</div>

          <div
            class="equipment-item"
            v-for="p in partList"
            :key="p.id"
            @click="selectPart(p)"
          >
            {{ p.name }}
          </div>
        </div>

        <!-- ⭐ Step 2: 운동기구 선택 -->
        <div v-else>
          <div class="modal-title">
            {{ selectedPartName }} 관련 운동기구
            <button type="button" class="back-btn" @click="resetPart">
              ← 뒤로
            </button>
          </div>

          <div
            class="equipment-item"
            v-for="eq in equipmentList"
            :key="eq.id"
            @click="selectEquipment(eq)"
          >
            {{ eq.name }}
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import DailyWorkoutRecordApi from '@/api/dailyWorkoutRecordApi.js'
import RecordHeaderBar from '@/pages/DailyWorkoutRecord/RecordHeaderBar.vue'
import EquipmentApi from '@/api/equipmentApi.js'
import PartApi from '@/api/partApi.js'

export default {
  name: 'RecordPage',
  components: { RecordHeaderBar },

  data() {
    return {
      date: this.$route.query.date,

      recordId: null,
      previewImg: null,

      rows: [],

      modalOpen: false,
      modalRowIndex: null,

      // ⭐ 기존 EQUIPMENTS 제거 (백엔드 방식으로 교체)
      partList: [],          // 운동 부위 목록
      selectedPartId: null,  // 선택된 부위 ID
      selectedPartName: null,// 선택된 부위 이름
      equipmentList: [],     // 선택된 부위의 운동기구 리스트
    }
  },

  async created() {
    await this.initRecord();
    await this.loadParts();
  },


  methods: {
    // ⭐ 부위 목록 로딩
    async loadParts() {
      const res = await PartApi.getParts();
      this.partList = res.data.data ?? res.data;
    },

    async initRecord() {
      const res = await DailyWorkoutRecordApi.initRecord(this.date)
      this.recordId = res.data.recordId

      if (!res.data.isNew) {
        await this.loadExistingRecord()
      }
    },

    async loadExistingRecord() {
      const res = await DailyWorkoutRecordApi.getRecord(this.date)
      const data = res.data

      if (data.workoutImg) {
        this.previewImg = `http://localhost:8888/uploads/${data.workoutImg}`
      }

      this.rows = data.exercises.map((e) => ({
        exerciseName: e.exerciseName,
        part: e.exercisePart,
        reps: e.reps,
        weight: e.weight,
        duration: e.duration,
        equipmentName: e.equipmentName ?? '',
        equipmentId: e.equipmentId ?? null,
      }))
    },

    triggerFileSelect() {
      this.$refs.fileInput.click();
    },

    addRow() {
      this.rows.push({
        exerciseName: '',
        part: '',
        reps: null,
        weight: null,
        duration: null,
        equipmentName: '',
        equipmentId: null,
      })
    },

    deleteRow(idx) {
      this.rows.splice(idx, 1)
    },

    async onImageSelect(e) {
      const file = e.target.files[0]
      if (!file) return

      this.previewImg = URL.createObjectURL(file)

      await DailyWorkoutRecordApi.uploadImage(this.date, file)
    },

    // 🔥 모달 열기
    openModal(index) {
      this.modalRowIndex = index;
      this.selectedPartId = null; // ⭐ 초기화
      this.selectedPartName = null;
      this.equipmentList = [];
      this.modalOpen = true;
    },

    closeModal() {
      this.modalOpen = false
    },

    // 🔥 Step1: 부위 선택 → 운동기구 가져오기
    async selectPart(part) {
      this.selectedPartId = part.id;
      this.selectedPartName = part.name;

      const res = await EquipmentApi.getEquipmentsByPart(part.id);
      this.equipmentList = res.data.data ?? res.data;
    },

    resetPart() {
      this.selectedPartId = null;
      this.selectedPartName = null;
      this.equipmentList = [];
    },

    // 🔥 Step2: 기구 선택 → 자동 매핑
    selectEquipment(eq) {
      const row = this.rows[this.modalRowIndex];

      row.equipmentName = eq.name;
      row.equipmentId = eq.id;
      row.part = eq.partName;   // ⭐ 부위 자동 매핑

      this.modalOpen = false;
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
          equipmentId: r.equipmentId,
          orderIndex: i,
        })),
      }

      await DailyWorkoutRecordApi.saveRecord(payload)
      alert('저장 완료!')
    },
  },
}
</script>



<style scoped>
.page-wrapper {
  padding: 0px 30px;
  height: calc(100vh - 100px);
  background: #000000;
  box-sizing: border-box;
  overflow: hidden;
}

.header-bar h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #222;
}

.page-title{
  margin-left: 10px;
  font-size: 36px;
  font-weight: 700;
  color: #ffffff;
}

/* ==== 제목 ==== */
h1 {
  font-size: 24px;
  font-weight: 700;
  color: #222;
  margin-bottom: 22px;
  letter-spacing: -0.2px;
}

/* ==== 전체 레이아웃 ==== */
.record-wrapper {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 32px;
  height: calc(100% - 170px);
  overflow: hidden;
}

/* ==== 테이블 박스 ==== */
.table-box {
  background: #fff;
  padding: 20px 24px;
  border-radius: 12px;
  border: 1px solid #e2e2e2;
  overflow-y: auto;
}

/* ==== 테이블 ==== */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th {
  padding: 12px;
  background: #f4f4f4;
  font-weight: 600;
  border-bottom: 1px solid #ddd;
  color: #444;
}

td {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

/* ==== 인풋 공통 ==== */
td input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #cfcfcf;
  border-radius: 6px;
  font-size: 14px;
  color: #222;
  background: #fff;
  transition: 0.15s ease;
}

td input:hover {
  border-color: #b5b5b5;
}

td input:focus {
  border-color: #e60023;
  outline: none;
  box-shadow: 0 0 0 2px rgba(230, 0, 35, 0.16);
}

/* 기구 선택 칸 */
.equipment-input {
  background: #fafafa;
  cursor: pointer;
}

/* ==== 삭제 버튼 ==== */
.delete-btn {
  background: none;
  border: none;
  color: #d32f2f;
  font-size: 18px;
  cursor: pointer;
}
.delete-btn:hover {
  color: #b30000;
}

/* ==== 행 추가 버튼 ==== */
.add-row-btn {
  margin-top: 14px;
  padding: 10px 18px;
  background: #333;
  color: #fff;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  cursor: pointer;
  font-weight: 600;
}
.add-row-btn:hover {
  background: #111;
}

/* ==== 이미지 박스 ==== */

.hidden-file-input {
  display: none;
}

.img-box {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e2e2e2;
}

.preview {
  width: 100%;
  height: 600px;
  border-radius: 12px;
  border: 2px dashed #bbb;
  background: #f8f8f8;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  color: #777;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preview:hover {
  border-color: #e60023;
  color: #e60023;
}

.preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ==== 저장 버튼 ==== */
.save-btn {
  margin-top: 22px;
  padding: 12px 26px;
  background: #e60023;
  color: #fff;
  border-radius: 10px;
  border: none;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.save-btn:hover {
  background: #ff2e4f;
}

/* ==== 모달 ==== */
.modal-bg {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: #fff;
  padding: 20px 22px;
  width: 360px;
  border-radius: 12px;
  animation: fadeIn 0.22s ease-out;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 14px;
}


.equipment-item {
  padding: 10px 12px;
  background: #f7f7f7;
  border-radius: 8px;
  border: 1px solid #ddd;
  margin-bottom: 10px;
  cursor: pointer;
}

.equipment-item:hover {
  background: #e60023;
  border-color: #e60023;
  color: #fff;
}

.back-btn {
  float: right;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  padding: 2px 6px;
}

.back-btn:hover {
  color: #e60023;
  text-decoration: underline;
}

</style>
