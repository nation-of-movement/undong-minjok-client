<template>
  <RecordHeaderBar />

  <div class="page">
    <h2 class="title floating-title">
      오늘도 오운완 챌린지 성공해볼까요?
    </h2>

    <div class="container">
      <!-- 달력 영역 -->
      <div class="calendar-box card">
        <div class="month-title">{{ year }}년 {{ month }}월</div>

        <!-- 요일 -->
        <div class="weekday-row">
          <div class="weekday" v-for="w in weekdays" :key="w">
            {{ w }}
          </div>
        </div>

        <!-- 날짜 -->
        <div class="calendar-grid">
          <div
            class="day"
            v-for="day in days"
            :key="day"
            :class="{ selected: selectedDay === day }"
            @click="selectDay(day)"
            @dblclick="goRecordPage(day)"
          >
            <div class="day-date">{{ day }}</div>

            <img
              v-if="photos[day]"
              :src="photos[day]"
              class="day-photo"
            />
          </div>
        </div>
      </div>

      <!-- 템플릿 보관함 -->
      <div class="template-box card">
        <h3 class="section-title">템플릿 보관함</h3>
        <p class="subtitle">
          날짜를 선택한 후 템플릿을 적용할 수 있습니다.
        </p>

        <div
          v-for="tpl in templateList"
          :key="tpl.templateId"
          class="template-card"
        >
          <img
            v-if="tpl.imgPath"
            :src="`${IMAGE_BASE_URL}${tpl.imgPath}`"
            class="template-thumbnail"
          />

          <div class="template-title">{{ tpl.templateName }}</div>

          <div class="template-meta">
            작성자: {{ tpl.creatorNickname ?? '익명' }}
          </div>

          <button
            class="apply-btn"
            @click="applyTemplate(tpl.templateId)"
          >
            적용하기
          </button>

          <button
            class="delete-btn"
            @click="deleteTemplate(tpl.templateId)"
          >
            삭제하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import RecordHeaderBar from '@/pages/DailyWorkoutRecord/RecordHeaderBar.vue'
import dailyWorkoutRecordApi from '@/api/dailyWorkoutRecordApi.js'
import templateStorageApi from '@/api/templateStorageApi.js'

const IMAGE_BASE_URL = import.meta.env.VITE_IMG_BASE_URL;

export default {
  name: 'CalendarPage',
  components: { RecordHeaderBar },

  props: {
    year: String,
    month: String,
  },

  data() {
    return {
      IMAGE_BASE_URL,
      selectedDay: null,
      days: [],
      weekdays: ['월', '화', '수', '목', '금', '토', '일'],
      templateList: [],
      photos: {},
    };
  },

  created() {
    this.generateDays();
  },

  mounted() {
    this.loadTemplates();
    this.loadPhotos();
  },

  methods: {
    // 현재 월 날짜 생성
    generateDays() {
      const lastDay = new Date(this.year, this.month, 0).getDate();
      this.days = Array.from({ length: lastDay }, (_, i) => i + 1);
    },

    // 월별 운동 사진 조회
    async loadPhotos() {
      const res = await dailyWorkoutRecordApi.getMonthlyPhotos(
        this.year,
        this.month
      );

      const list = res.data.data ?? res.data;
      this.photos = {};

      list.forEach(item => {
        this.photos[item.day] =
          `${this.IMAGE_BASE_URL}${item.workoutImg}`;
      });
    },

    // 날짜 선택
    selectDay(day) {
      this.selectedDay = day;
    },

    // 날짜 더블 클릭 → 기록 페이지
    goRecordPage(day) {
      const date = `${this.year}-${String(this.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      this.$router.push({
        name: 'Record',
        query: { date },
      });
    },

    // 템플릿 보관함 조회
    async loadTemplates() {
      const res = await templateStorageApi.getStorageList();
      this.templateList = res.data.data ?? res.data;
    },

    // 템플릿 적용
    async applyTemplate(templateId) {
      if (!this.selectedDay) {
        alert('먼저 날짜를 선택해주세요.');
        return;
      }

      const date = `${this.year}-${String(this.month).padStart(2, '0')}-${String(this.selectedDay).padStart(2, '0')}`;

      await templateStorageApi.applyTemplate(templateId, date);
      alert(`템플릿이 ${date}에 적용되었습니다.`);
    },

    // 템플릿 삭제
    async deleteTemplate(templateId) {
      if (!confirm('정말 삭제하시겠습니까?')) return;

      await templateStorageApi.deleteFromStorage(templateId);
      this.templateList =
        this.templateList.filter(t => t.templateId !== templateId);

      alert('삭제되었습니다.');
    },
  },
};
</script>


<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 80vh;
  overflow: hidden;
  background: #000;
  color: white;
  padding: 0 30px;
  box-sizing: border-box;
}

.title {
  font-size: 22px;
  font-weight: 800;
  text-align: center;
  /*margin-bottom: 40px;*/
  color: #ffffff;
  opacity: 0.95;
  text-shadow: 0 0 10px rgba(230, 0, 35, 0.4);
  animation: fadeInDrop 1s ease-out forwards;
}
.floating-title {
  animation: float 3s ease-in-out infinite;
  animation-delay: 1s;
}

.container {
  flex: 1;
  display: flex;
  gap: 20px;
  overflow: hidden; /* 내부 스크롤 제거 */
}

.card {
  background: #fff;
  color: #333;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 4px 12px rgba(255, 0, 40, 0.15);
  overflow: hidden;
}

.calendar-box {
  width: 70%;
  min-width: 480px;
  /*
  height: calc(100% - 150px);
  */
  overflow: hidden; /* 달력 박스 자체에 스크롤 없음 */
}

.month-title {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 10px;
  color: #e60023;
}

.weekday-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 6px;
  opacity: 0.7;
}

.weekday {
  text-align: center;
  font-weight: 600;
  color: #555;
  font-size: 13px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  height: calc(100% - 70px);
}

.day {
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fafafa;
  cursor: pointer;
  position: relative;
  transition: 0.2s;
  min-height: 45px;
  position: relative;
  overflow: hidden;
}
.day-photo {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}



.day:hover {
  background: #ffe2e6;
  border-color: #e60023;
}

.day-date {
  position: absolute;
  top: 4px;
  right: 6px;
  font-weight: bold;
  font-size: 12px;
  z-index: 2;
  color: #333;
}

.selected {
  background: #ffe6ea;
  border: 2px solid #e60023;
}

.template-box {
  width: 28%;
  min-width: 220px;
  /*height: calc(100% - 150px);*/
  overflow-y: auto; /* ⬅ 오직 여기만 스크롤 활성화 */
  overflow-x: hidden;
}

.section-title {
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 4px;
}

.subtitle {
  opacity: 0.6;
  font-size: 12px;
  margin-bottom: 10px;
}

.template-thumbnail {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
  background: #f3f3f3;
}

.template-card {
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 10px;
  border: 1px solid #e5e5e5;
  background: #f9f9f9;
  cursor: pointer;
  transition: 0.22s;
}
.template-card:hover {
  background: #ffe2e6;
  border-color: #e60023;
  transform: translateY(-1px);
}

.template-title {
  font-size: 14px;
  font-weight: bold;
}

.template-meta {
  font-size: 11px;
  opacity: 0.7;
}

.apply-btn {
  margin-top: 8px;
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: #e60023;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}

.apply-btn:hover {
  background: #ff3355;
}

.delete-btn {
  margin-top: 6px;
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: #444;
  color: white;
  cursor: pointer;
  transition: 0.2s;
}

.delete-btn:hover {
  background: #222;
}



@keyframes fadeInDrop {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0);
  }
}

</style>
