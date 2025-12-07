<template>
  <div class="page">
    <h1 class="title">오늘도 힘내봐요! 💪<br> 연도 & 월을 골라주세요</h1>

    <!-- 연도 선택 -->
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

    <!-- 월 선택 -->
    <div class="month-grid">
      <div
        v-for="m in 12"
        :key="m"
        class="month-card"
        @click="goToCalendar(m)"
      >
        {{ m }}월
      </div>
    </div>

  </div>
</template>


<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

/* 최근 5년 */
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

const selectedYear = ref(currentYear);

function goToCalendar(month) {
  const monthStr = String(month).padStart(2, "0");

  router.push({
    name: "Calendar",
    params: { year: selectedYear.value, month: monthStr }
  });
}
</script>


<style scoped>
.page {
  padding: 60px 20px;
  min-height: 100vh;
  background: #000;
  color: white;
  font-family: "Pretendard", sans-serif;
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
  opacity: 0.95;
  color: #fff;
}

/*연도 선택 버튼 */
.year-selector {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 35px;
}

.year-btn {
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.12); /* 좀 더 밝게 */
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  color: #eee;
  transition: 0.2s;
}

.year-btn:hover {
  border-color: #E60023;
  color: #E60023;
  background: rgba(230, 0, 35, 0.08);
}

.year-btn.active {
  background: #E60023;
  color: #fff;
  border-color: #E60023;
}

/*  월 선택 그리드 */
.month-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  padding: 10px 20px;
}

/*  월 카드  */
.month-card {
  background: rgb(255, 255, 255); /* 기존보다 훨씬 밝게 */
  padding: 18px 0;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.25s;
  color: #000000;
}

.month-card:hover {
  transform: translateY(-4px);
  background: rgb(230, 0, 35);
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(255, 0, 40, 0.22);
}
</style>
