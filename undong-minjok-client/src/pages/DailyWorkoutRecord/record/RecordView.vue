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

        <input class="search-input" v-model="partKeyword" placeholder="예: 가슴, 어깨, 등" />

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
import DailyWorkoutRecordApi from '@/api/dailyWorkoutRecordApi.js'
import RecordHeaderBar from '@/pages/DailyWorkoutRecord/RecordHeaderBar.vue'

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
      partKeyword: '',
      modalRowIndex: null,

      EQUIPMENTS: {
        가슴: ['벤치프레스 머신', '덤벨', '펙덱 플라이', '푸쉬업바'],
        등: ['랫풀다운', '바벨', '케이블 로우', '풀업바'],
        어깨: ['덤벨', '숄더프레스 머신', '케이블'],
        하체: ['스쿼트랙', '레그프레스', '레그익스텐션'],
        팔: ['EZ바', '덤벨', '케이블'],
        전신: ['케틀벨', '바벨', '덤벨'],
      },
    }
  },

  computed: {
    filteredEquipments() {
      if (!this.partKeyword) return []
      const key = Object.keys(this.EQUIPMENTS).find((k) => k.includes(this.partKeyword))
      return key ? this.EQUIPMENTS[key] : []
    },
  },

  async created() {
    await this.initRecord()
  },

  methods: {
    goBack() {
      this.$router.back()
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

      // 이미지 절대 경로로 변환
      if (data.workoutImg) {
        this.previewImg = `http://localhost:8888/uploads/${data.workoutImg}`
        console.log('이미지 URL:', this.previewImg)
      }

      this.rows = data.exercises.map((e) => ({
        exerciseName: e.exerciseName,
        part: e.exercisePart, // 정상 매핑
        reps: e.reps,
        weight: e.weight,
        duration: e.duration,
        equipmentName: e.equipmentName ?? '',
        equipmentId: null,
      }))
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

    openModal(index) {
      this.modalRowIndex = index
      this.partKeyword = ''
      this.modalOpen = true
    },
    closeModal() {
      this.modalOpen = false
    },
    selectEquipment(eq) {
      this.rows[this.modalRowIndex].equipmentName = eq
      this.closeModal()
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
.img-box {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e2e2e2;
}

.preview {
  width: 100%;
  height: 310px;
  border-radius: 10px;
  border: 1px dashed #bbb;
  background: #fafafa;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  color: #777;
  margin-bottom: 14px;
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

.search-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 14px;
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
</style>
