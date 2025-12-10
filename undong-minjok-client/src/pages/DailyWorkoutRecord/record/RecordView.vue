<template>
  <RecordHeaderBar />

  <div class="page-wrapper">
    <h1 class="page-title">{{ date }} 오늘도 성장하는 중</h1>

    <div class="record-wrapper">
      <!-- 운동 기록 테이블 -->
      <div class="table-box">
        <table>
          <thead>
          <tr>
            <th style="width: 40px;">↕</th>
            <th>운동명</th>
            <th>부위</th>
            <th>기구</th>
            <th>횟수</th>
            <th>중량(kg)</th>
            <th>시간(분)</th>
            <th></th>
          </tr>
          </thead>

          <draggable
            v-model="rows"
            item-key="id"
            tag="tbody"
            handle=".drag-handle"
          >
            <template #item="{ element: row, index: idx }">
              <tr :key="row.id">

                <!-- 드래그 핸들 버튼 추가 -->
                <td class="drag-handle" style="cursor: grab; text-align:center; font-size:18px;">
                  ≡
                </td>

                <td><input v-model="row.exerciseName" /></td>
                <td><input v-model="row.part" /></td>
                <td>
                  <input
                    class="equipment-input"
                    readonly
                    placeholder="기구 선택"
                    v-model="row.equipmentName"
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

      <!-- 이미지 업로드 박스 -->
      <div class="img-box">
        <div class="preview" @click="triggerFileSelect">
          <img v-if="previewImg" :src="previewImg" />
          <span v-else>사진 업로드 (클릭)</span>
        </div>

        <!-- 파일 업로드 -->
        <input
          type="file"
          ref="fileInput"
          class="hidden-file-input"
          @change="onImageSelect"
        />
      </div>
    </div>

    <button class="save-btn" @click="saveRecord">저장하기</button>

    <!-- 운동기구 선택 모달 -->
    <div class="modal-bg" v-show="modalOpen" @click.self="closeModal">
      <div class="modal">

        <!--운동 부위 선택 -->
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

        <!-- 운동기구 선택 -->
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
import DailyWorkoutRecordApi from "@/api/dailyWorkoutRecordApi.js";
import RecordHeaderBar from "@/pages/DailyWorkoutRecord/RecordHeaderBar.vue";
import EquipmentApi from "@/api/equipmentApi.js";
import PartApi from "@/api/partApi.js";
import draggable from "vuedraggable";


export default {
  name: "RecordPage",
  components: { RecordHeaderBar, draggable },

  props: {
    date: String
  },

  data() {
    return {
      /*// URL에서 전달받은 날짜
      date: this.$route.query.date,*/

      // 기록 ID (처음 생성 시 백엔드에서 반환)
      recordId: null,

      // 업로드된 이미지 미리보기 경로
      previewImg: null,

      // 운동 기록 행 리스트
      rows: [],

      // 모달 열림 여부
      modalOpen: false,

      // 어떤 행에서 기구 선택 중인지 저장
      modalRowIndex: null,

      // 운동 부위 목록
      partList: [],

      // 현재 선택된 부위 ID
      selectedPartId: null,

      // 현재 선택된 부위 이름
      selectedPartName: null,

      // 선택된 부위에 해당하는 운동기구 목록
      equipmentList: [],
    };
  },

  async created() {
    await this.initRecord(); // 오늘 날짜에 해당하는 기록 생성 또는 조회
    await this.loadParts();  // 운동 부위 목록 불러오기
  },

  methods: {

    //기록 존재 여부 확인 후 새로 생성 또는 기존 기록 표시
    async initRecord() {
      const res = await DailyWorkoutRecordApi.initRecord(this.date);
      this.recordId = res.data.recordId;

      if (!res.data.isNew) {
        await this.loadExistingRecord();
      }
    },

    // 기존에 저장된 운동 기록 불러오기
    async loadExistingRecord() {
      const res = await DailyWorkoutRecordApi.getRecord(this.date);
      const data = res.data;

      // 기존 이미지 적용
      if (data.workoutImg) {
        this.previewImg = `http://localhost:8888/uploads/${data.workoutImg}`;
      }

      // 기존 운동 리스트 매핑
      this.rows = data.exercises.map((e) => ({
        id: e.id ?? Date.now() + Math.random(),
        exerciseName: e.exerciseName,
        part: e.exercisePart,
        reps: e.reps,
        weight: e.weight,
        duration: e.duration,
        equipmentName: e.equipmentName ?? "",
        equipmentId: e.equipmentId ?? null,
      }));
    },

    // 이미지 업로드 input 열기 (커스텀 클릭)
    triggerFileSelect() {
      this.$refs.fileInput.click();
    },

    //새로운 행 추가
    addRow() {
      this.rows.push({
        id: Date.now() + Math.random(),
        exerciseName: "",
        part: "",
        reps: null,
        weight: null,
        duration: null,
        equipmentName: "",
        equipmentId: null,
      });
    },

    //선택한 행 삭제
    deleteRow(idx) {
      this.rows.splice(idx, 1);
    },

    //이미지 선택 시 미리보기
    async onImageSelect(e) {
      const file = e.target.files[0];
      if (!file) return;

      this.previewImg = URL.createObjectURL(file);

      await DailyWorkoutRecordApi.uploadImage(this.date, file);
    },

    //운동 부위 목록 백엔드에서 조회
    async loadParts() {
      const res = await PartApi.getParts();
      this.partList = res.data.data ?? res.data;
    },

    //운동기구 선택 모달 열기
    openModal(index) {
      this.modalRowIndex = index;
      this.selectedPartId = null;
      this.selectedPartName = null;
      this.equipmentList = [];
      this.modalOpen = true;
    },

    //운동기구 선택 모달 닫기
    closeModal() {
      this.modalOpen = false;
    },

    //부위 선택 -> 해당 부위 운동기구 보여주기
    async selectPart(part) {
      this.selectedPartId = part.id;
      this.selectedPartName = part.name;

      const res = await EquipmentApi.getEquipmentsByPart(part.id);
      this.equipmentList = res.data.data ?? res.data;
    },

    //뒤로 돌아가기(운동 기구 -> 부위 선택)
    resetPart() {
      this.selectedPartId = null;
      this.selectedPartName = null;
      this.equipmentList = [];
    },

    //기구 선택 시 해당 행에 자동 적용
    selectEquipment(eq) {
      const row = this.rows[this.modalRowIndex];

      row.equipmentName = eq.name;
      row.equipmentId = eq.id;
      row.part = eq.partName;

      this.modalOpen = false;
    },

    //기록 저장
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
      alert("저장 완료!");
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

.drag-handle {
  cursor: grab;
  color: #666;
  user-select: none;
}
.drag-handle:active {
  cursor: grabbing;
}


</style>
