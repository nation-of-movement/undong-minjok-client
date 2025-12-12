<template>
  <div class="modal-overlay" >
    <div class="modal-container">

      <h2 class="modal-title">새 템플릿 등록하기</h2>

      <!-- 2컬럼 레이아웃 -->
      <div class="modal-body-grid">

        <!-- LEFT AREA (기본정보 + Day + 운동 목록)                   -->
        <div class="left-panel">
          <div class="section">
            <label>템플릿 제목</label>
            <input v-model="name" class="input" type="text" placeholder="예: 7일 분할 루틴" />

            <label>설명</label>
            <textarea v-model="content" class="textarea" placeholder="템플릿 설명을 입력하세요"></textarea>

            <label>가격</label>
            <input
              v-model.number="price"
              class="input"
              type="number"
              min="0"
              placeholder="가격을 입력하세요 (숫자만)"
            />
          </div>

          <!-- Day 탭 -->
          <div class="day-tabs">
            <button
              v-for="d in 7"
              :key="d"
              :class="['day-tab', { active: currentDay === d }]"
              @click="currentDay = d"
            >
              Day {{ d }}
            </button>
          </div>

          <!-- 운동 입력 UI -->
          <div class="exercise-section">
            <h3>Day {{ currentDay }} 운동 목록</h3>

            <div
              v-for="(ex, idx) in dayExercises[currentDay]"
              :key="idx"
              class="exercise-item"
            >
              <input v-model="ex.name" class="input-sm" placeholder="운동명" />
              <input v-model.number="ex.reps" class="input-sm" type="number" placeholder="횟수" />
              <input v-model.number="ex.weight" class="input-sm" type="number" placeholder="무게(kg)" />
              <input v-model.number="ex.duration" class="input-sm" type="number" placeholder="시간(sec)" />

              <!-- 부위 직접 입력 -->
              <input
                v-model="ex.part"
                class="input-sm"
                type="text"
                placeholder="부위 입력 (예: 가슴, 등, 하체)"
              />

              <!-- 장비 -->
              <select v-model="ex.equipmentId" class="input-sm">
                <option :value="null">장비 없음</option>
                <option
                  v-for="eq in equipments"
                  :key="eq.id"
                  :value="eq.id"
                >
                  {{ eq.name }}
                </option>
              </select>

              <button class="delete-btn" @click="removeExercise(idx)">삭제</button>
            </div>


            <button class="add-btn" @click="addExercise">+ 운동 추가</button>
          </div>
        </div>

        <!-- RIGHT AREA (이미지 업로드 두 개) — 고정, 스크롤 안됨      -->
        <div class="right-panel">
          <h3 class="right-title">이미지 등록</h3>

          <div class="image-box">
            <label>썸네일 이미지</label>
            <input type="file" @change="onThumbnailChange" />

            <div class="image-preview-frame">
              <img
                v-if="previewThumbnail"
                :src="previewThumbnail"
                class="image-preview"
              />
              <div v-else class="image-preview empty">이미지를 선택하세요</div>
            </div>
          </div>

          <div class="image-box">
            <label>상세 이미지</label>
            <input type="file" @change="onDetailImageChange" />

            <div class="image-preview-frame">
              <img
                v-if="previewDetail"
                :src="previewDetail"
                class="image-preview"
              />
              <div v-else class="image-preview empty">이미지를 선택하세요</div>
            </div>
          </div>
        </div>

      </div>

      <!-- 등록 버튼 -->
      <div class="bottom-buttons">
        <button class="submit-btn" @click="submitTemplate">등록하기</button>
        <button class="cancel-btn" @click="close">닫기</button>
      </div>

    </div>
  </div>
</template>


<script>
import api from "@/api/axios";

export default {
  name: "CreateTemplateModal",

  data() {
    return {
      name: "",
      content: "",
      price: 0,

      thumbnailFile: null,
      detailImageFile: null,

      previewThumbnail: null,
      previewDetail: null,

      currentDay: 1,

      dayExercises: {
        1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [],
      },
      equipments: [],
    };
  },

  async created() {
    await this.fetchEquipments();
  },

  methods: {
    close() {
      this.$emit("close");
    },

    /* ================= 이미지 ================= */

    onThumbnailChange(e) {
      this.thumbnailFile = e.target.files[0];
      if (this.thumbnailFile) {
        this.previewThumbnail = URL.createObjectURL(this.thumbnailFile);
      }
    },

    onDetailImageChange(e) {
      this.detailImageFile = e.target.files[0];
      if (this.detailImageFile) {
        this.previewDetail = URL.createObjectURL(this.detailImageFile);
      }
    },

    async fetchEquipments() {
      try {
        const res = await api.get("/equipments/all")
        this.equipments = res.data.data || res.data || [];
      } catch (e) {
        console.error("장비 목록 로드 실패", e);
      }
    },

    /* ================= 운동 행 추가/삭제 ================= */

    addExercise() {
      const d = this.currentDay;
      if (!this.dayExercises[d]) this.$set(this.dayExercises, d, []);

      this.dayExercises[d].push({
        day: d,
        name: "",
        part: null,      //  부위 id
        reps: null,
        weight: null,
        duration: null,
        orderIndex: this.dayExercises[d].length + 1,
        equipmentId: null, //  장비 id
      });
    },

    removeExercise(index) {
      const d = this.currentDay;
      if (!this.dayExercises[d]) return;
      this.dayExercises[d].splice(index, 1);
    },

    /* ================= 등록 ================= */

    async submitTemplate() {
      // dayExercises -> 평탄화하면서 orderIndex 다시 정리
      const exercises = [];
      for (let d = 1; d <= 7; d++) {
        const list = this.dayExercises[d] || [];
        list.forEach((ex, idx) => {
          exercises.push({
            day: d,
            name: ex.name,
            part: ex.part,          // 백엔드 DTO에 맞춰 사용
            reps: ex.reps,
            weight: ex.weight,
            duration: ex.duration,
            orderIndex: idx + 1,
            equipmentId: ex.equipmentId,
          });
        });
      }

      const dto = {
        name: this.name,
        content: this.content,
        price: this.price,
        status: this.price > 0 ? "PAID" : "FREE",
        exercises,
      };

      const form = new FormData();
      form.append("data", JSON.stringify(dto));
      if (this.thumbnailFile) form.append("thumbnail", this.thumbnailFile);
      if (this.detailImageFile) form.append("detailImage", this.detailImageFile);

      try {
        await api.post("/templates", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        alert("템플릿이 성공적으로 등록되었습니다!");
        this.$emit("success");
      } catch (err) {
        console.error("템플릿 생성 실패", err);
        alert("템플릿 생성 중 오류가 발생했습니다.");
      }
    },
  },
};
</script>


<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-container {
  width: 1050px;
  max-height: 92vh;
  overflow-y: hidden;
  background: #111;
  padding: 30px;
  border-radius: 14px;
  color: white;
  border: 1px solid rgba(255,255,255,0.15);
}

.modal-title {
  font-size: 24px;
  margin-bottom: 10px;
}

.modal-body-grid {
  display: flex;
  gap: 30px;
  height: 70vh;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox 숫자 입력창 스핀 제거 */
input[type="number"] {
  -moz-appearance: textfield;
}

/* LEFT PANEL — 운동 추가해도 스크롤 */
.left-panel {
  flex: 2;
  max-height: 70vh;
  overflow-y: visible;
  padding-right: 5px;
}

/* RIGHT PANEL — 고정 위치 */
.right-panel {
  flex: 1;
  background: #181818;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.12);
  height: 80%;
  position: sticky;
  top: 0;
}

.image-box {
  margin-bottom: 30px;   /* 썸네일~상세 이미지 간 여유 공간 */
  display: flex;
  flex-direction: column;
}

.right-title {
  margin-bottom: 15px;
}

/* 이미지 미리보기 프레임 */
.image-preview-frame {
  width: 100%;
  height: 130px;
  aspect-ratio: 1 / 1;
  background: #121212;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.15);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  overflow: hidden;
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-preview.empty {
  color: rgba(255,255,255,0.4);
  font-size: 13px;
}

/* Inputs */
.input, .textarea, select, .input-sm {
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  background: #222;
  color: white;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
}

.input-sm {
  width: 140px;
}

.textarea {
  min-height: 80px;
}

.day-tabs {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.day-tab {
  padding: 10px 15px;
  background: #222;
  border-radius: 8px;
  cursor: pointer;
}
.day-tab.active {
  background: #e60023;
}

.exercise-item {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.add-btn {
  margin-top: 10px;
  padding: 10px;
  background: #333;
  border-radius: 6px;
}

.delete-btn {
  background: #b80000;
  padding: 6px 10px;
  border-radius: 6px;
}

.bottom-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.submit-btn {
  padding: 10px 20px;
  background: #e60023;
  border-radius: 8px;
}

.cancel-btn {
  padding: 10px 20px;
  background: #333;
  border-radius: 8px;
}
</style>
