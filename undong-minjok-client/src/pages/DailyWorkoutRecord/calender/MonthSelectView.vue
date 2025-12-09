<template>
  <div class="page">
    <RecordHeaderBar />

    <div class="content">
      <h1 class="title">
        오늘도 힘내봐요!<br />
        연도 & 월을 골라주세요
      </h1>

      <!-- 연도 선택 영역 -->
      <div class="year-selector">
        <button
          v-for="y in years"
          :key="y"
          class="year-btn"
          :class="{ active: y === selectedYear }"
          @click="selectedYear = y"
        >
          {{ y }}년
        </button>
      </div>

      <!-- 월 선택 카드 -->
      <div class="month-grid">
        <div v-for="m in 12" :key="m" class="month-card" @click="goToCalendar(m)">{{ m }}월</div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import RecordHeaderBar from '@/pages/DailyWorkoutRecord/RecordHeaderBar.vue'

  const router = useRouter()

  // 현재 연도 계산
  const currentYear = new Date().getFullYear()

  // 선택 가능한 연도 목록 생성
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  // 현재 선택된 연도 (기본값: 올해)
  const selectedYear = ref(currentYear)


  // 월 선택 시 해당 연·월의 캘린더 페이지로 이동
  function goToCalendar(month) {
    const monthStr = String(month).padStart(2, '0')

    router.push({
      name: 'Calendar',
      params: {
        year: selectedYear.value,
        month: monthStr,
      },
    })
  }
</script>

<style scoped>
.page {
  background: #000;
  height: 100vh;
  overflow: hidden;
  color: white;
  font-family: 'Pretendard', sans-serif;
}

.content {
  padding-top: 80px;
  text-align: center;

  max-width: 900px;
  margin: 0 auto;
}

/* 타이틀 */
.title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 35px;
  line-height: 1.5;
}

/* 연도 선택 */
.year-selector {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 35px;
}

.year-btn {
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  color: #eee;
  transition: 0.2s;
}

.year-btn:hover {
  border-color: #e60023;
  color: #e60023;
  background: rgba(230, 0, 35, 0.08);
}

.year-btn.active {
  background: #e60023;
  color: #fff;
  border-color: #e60023;
}

/* 월 카드 그리드 */
.month-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  padding: 0 20px;
}

/* 월 카드 */
.month-card {
  background: #ffffff;
  padding: 18px 0;
  border-radius: 12px;
  color: black;
  font-size: 18px;
  cursor: pointer;
  transition: 0.3s;
}

.month-card:hover {
  transform: translateY(-4px);
  background: #e60023;
  color: white;
}
</style>
