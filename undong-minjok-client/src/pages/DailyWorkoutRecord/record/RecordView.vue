<template>
  <RecordHeaderBar />

  <div class="page-wrapper">
    <h1 class="page-title">{{ date }} 오늘도 성장하는 중</h1>

    <div class="record-wrapper">
      <div class="table-box">
        <table>
          <thead>
          <tr>
            <th style="width:40px;">↕</th>
            <th>운동명</th>
            <th>부위</th>
            <th>기구</th>
            <th>횟수</th>
            <th>중량</th>
            <th>시간</th>
            <th></th>
          </tr>
          </thead>

          <draggable
            v-model="rows"
            item-key="rowKey"
            tag="tbody"
            handle=".drag-handle"
          >
            <template #item="{ element: row, index: idx }">
              <tr>
                <td class="drag-handle">≡</td>

                <td><input v-model="row.exerciseName" /></td>
                <td><input v-model="row.part" /></td>

                <td>
                  <input
                    class="equipment-input"
                    readonly
                    v-model="row.equipmentName"
                    placeholder="기구 선택"
                    @click="openModal(idx)"
                  />
                </td>

                <td><input type="number" v-model.number="row.reps" /></td>
                <td><input type="number" v-model.number="row.weight" /></td>
                <td><input type="number" v-model.number="row.duration" /></td>

                <td>
                  <button class="delete-btn" @click="deleteRow(idx)">×</button>
                </td>
              </tr>
            </template>
          </draggable>
        </table>

        <button class="add-row-btn" @click="addRow">+ 행 추가</button>
      </div>

      <!-- 이미지 -->
      <div class="img-box">
        <div class="preview" @click="triggerFileSelect">
          <img v-if="previewImg" :src="previewImg" />
          <span v-else>사진 업로드</span>
        </div>
        <input type="file" ref="fileInput" hidden @change="onImageSelect" />
      </div>
    </div>

    <button class="save-btn" @click="saveRecord">저장하기</button>

    <!-- 모달 -->
    <div class="modal-bg" v-if="modalOpen" @click.self="closeModal">
      <div class="modal">
        <div v-if="!selectedPartId">
          <div class="modal-title">운동 부위 선택</div>
          <div
            class="equipment-item"
            v-for="p in partList"
            :key="p.id"
            @click="selectPart(p)"
          >
            {{ p.name }}
          </div>
        </div>

        <div v-else>
          <div class="modal-title">
            {{ selectedPartName }}
            <button class="back-btn" @click="resetPart">←</button>
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
import draggable from "vuedraggable";
import RecordHeaderBar from "@/pages/DailyWorkoutRecord/RecordHeaderBar.vue";
import DailyWorkoutRecordApi from "@/api/dailyWorkoutRecordApi";
import EquipmentApi from "@/api/equipmentApi";
import PartApi from "@/api/partApi";

const IMAGE_BASE_URL = import.meta.env.VITE_IMG_BASE_URL;

export default {
  components: { RecordHeaderBar, draggable },

  props: { date: String },

  data() {
    return {
      rows: [],
      previewImg: null,
      modalOpen: false,
      modalRowIndex: null,
      partList: [],
      selectedPartId: null,
      selectedPartName: null,
      equipmentList: [],
    };
  },

  async created() {
    await this.initRecord();
    await this.loadParts();
  },

  methods: {
    async initRecord() {
      const res = await DailyWorkoutRecordApi.initRecord(this.date);
      if (!res.data.isNew) await this.loadExistingRecord();
    },

    async loadExistingRecord() {
      const res = await DailyWorkoutRecordApi.getRecord(this.date);
      const data = res.data;

      if (data.workoutImg) {
        this.previewImg = `${IMAGE_BASE_URL}${data.workoutImg}`;
      }

      this.rows = data.exercises.map(e => ({
        rowKey: crypto.randomUUID(), // 🔥 절대 안 바뀌는 키
        exerciseName: e.exerciseName,
        part: e.exercisePart,
        reps: e.reps,
        weight: e.weight,
        duration: e.duration,
        equipmentName: e.equipmentName ?? "",
        equipmentId: e.equipmentId ?? null,
      }));
    },

    addRow() {
      this.rows.push({
        rowKey: crypto.randomUUID(), // 🔥 핵심
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

    openModal(idx) {
      this.modalRowIndex = idx;
      this.selectedPartId = null;
      this.modalOpen = true;
    },

    async selectPart(part) {
      this.selectedPartId = part.id;
      this.selectedPartName = part.name;
      const res = await EquipmentApi.getEquipmentsByPart(part.id);
      this.equipmentList = res.data.data ?? res.data;
    },

    selectEquipment(eq) {
      const row = this.rows[this.modalRowIndex];
      row.equipmentId = eq.id;
      row.equipmentName = eq.name;
      row.part = eq.partName;
      this.modalOpen = false;
    },

    resetPart() {
      this.selectedPartId = null;
    },

    closeModal() {
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
      };

      await DailyWorkoutRecordApi.saveRecord(payload);
      alert("저장 완료");
    },

    triggerFileSelect() {
      this.$refs.fileInput.click();
    },

    async onImageSelect(e) {
      const file = e.target.files[0];
      if (!file) return;
      this.previewImg = URL.createObjectURL(file);
      await DailyWorkoutRecordApi.uploadImage(this.date, file);
    },

    async loadParts() {
      const res = await PartApi.getParts();
      this.partList = res.data.data ?? res.data;
    },
  },
};
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
  font-size: 25px;
  font-weight: 700;
  color: #ffffff;
}

/* ==== 제목 ==== */
h1 {
  font-size: 20px;
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
  padding: 8px 6px;
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
  height: 430px;
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

.drag-handle {
  cursor: grab;
  color: #666;
  user-select: none;
}
.drag-handle:active {
  cursor: grabbing;
}


</style>
