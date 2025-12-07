<template>
  <div class="page">
    <h2 class="title floating-title">오늘도 오운완 챌린지 성공해볼까요? 📸💪</h2>
    <div class="container">
      <!-- 캘린더 박스 -->
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
            <!-- 날짜 숫자 -->
            <div class="day-date">{{ day }}</div>

            <!-- 오운완 사진 -->
            <img v-if="photos[day]" :src="photos[day]" class="day-photo" />
          </div>
        </div>
      </div>

      <!-- 템플릿 목록 -->
      <div class="template-box card">
        <h3 class="section-title">📦 템플릿 보관함</h3>
        <p class="subtitle">⬆ 날짜 한 번 클릭 후 적용할 템플릿을 골라주세요.</p>

        <div
          v-for="tpl in templateList"
          :key="tpl.templateId"
          class="template-card"
          @click="applyTemplate(tpl.templateId)"
        >
          <div class="template-title">{{ tpl.templateName }}</div>
          <div class="template-meta">작성자: {{ tpl.creatorNickname ?? '익명' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'CalendarPage',

  data() {
    return {
      year: null,
      month: null,
      days: [],
      selectedDay: null,

      weekdays: ['월', '화', '수', '목', '금', '토', '일'],
      templateList: [],

      photos: {
        5: '/uploads/sample.jpg',
        10: '/uploads/another.jpg',
      },
    }
  },

  created() {
    this.year = Number(this.$route.params.year)
    this.month = Number(this.$route.params.month)
    this.generateDays()
  },

  mounted() {
    this.loadTemplates()
  },

  methods: {
    generateDays() {
      const lastDay = new Date(this.year, this.month, 0).getDate()
      this.days = Array.from({ length: lastDay }, (_, i) => i + 1)
    },

    selectDay(day) {
      this.selectedDay = day
    },

    goRecordPage(day) {
      const date = `${this.year}-${String(this.month).padStart(2, '0')}-${String(day).padStart(
        2,
        '0',
      )}`

      this.$router.push({
        name: 'Record',
        query: { date },
      })
    },

    async loadTemplates() {
      const res = await fetch('/api/v1/templates/storage')
      this.templateList = await res.json()
    },

    async applyTemplate(templateId) {
      if (!this.selectedDay) {
        alert('먼저 날짜를 선택해주세요!')
        return
      }

      const date = `${this.year}-${String(this.month).padStart(2, '0')}-${String(
        this.selectedDay,
      ).padStart(2, '0')}`

      await fetch(`/api/v1/templates/storage/${templateId}/apply?date=${date}`, {
        method: 'POST',
      })

      alert(`템플릿이 ${date}에 적용되었어요!`)
    },
  },
}
</script>
<style scoped>
.page {
  padding: 20px;
  color: white;
  background: #000;
  min-height: 100vh;
  box-sizing: border-box;
}

/* 타이틀 영역 축소 */
.title {
  font-size: 22px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 15px;
  color: #ffffff;
  opacity: 0.95;
  text-shadow: 0 0 10px rgba(230, 0, 35, 0.4);

  animation: fadeInDrop 1s ease-out forwards;
}
.floating-title {
  animation: float 3s ease-in-out infinite;
  animation-delay: 1s;
}

/* container 높이를 화면에 맞게 */
.container {
  display: flex;
  gap: 20px;
  height: calc(100vh - 120px); /* 타이틀 + padding 제외한 전체 높이 */
}

/* 카드 스타일 (크기 축소) */
.card {
  background: #fff;
  color: #333;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 4px 12px rgba(255, 0, 40, 0.15);
  overflow: hidden;
}

/* 캘린더 박스 */
.calendar-box {
  width: 70%;
  min-width: 480px;
}

.month-title {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 10px;
  color: #e60023;
}

/* 요일 */
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

/* 날짜 */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  height: calc(100% - 60px); /* 달력 전체 높이 자동 조정 */
}

.day {
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fafafa;
  cursor: pointer;
  position: relative;
  transition: 0.2s;

  /* 새로 적용: 화면 높이에 따라 자동크기 */
  height: calc((100vh - 150px) / 7);
  min-height: 45px;

  /* 정사각형 제거 */
  /* aspect-ratio: 1 / 1;   <-- 삭제 */
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

/*.day-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}*/

.selected {
  background: #ffe6ea;
  border: 2px solid #e60023;
}

/* 템플릿 박스 */
.template-box {
  width: 28%;
  min-width: 220px;
  overflow-y: auto;
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

/* 템플릿 카드 */
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
  transform: translateY(-2px);
}

.template-title {
  font-size: 14px;
  font-weight: bold;
}

.template-meta {
  font-size: 11px;
  opacity: 0.7;
}

/* 타이틀 애니메이션 */
@keyframes fadeInDrop {
  0% { opacity: 0; transform: translateY(-20px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* 둥둥 */
@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0); }
}

</style>
