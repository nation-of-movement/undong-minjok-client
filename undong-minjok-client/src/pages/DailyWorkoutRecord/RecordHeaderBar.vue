<template>
  <header class="header">

    <div class="left-area">
      <!-- 뒤로가기 -->
      <button class="icon-btn" @click="goBack">
        <span class="material-icons">arrow_back_ios_new</span>
      </button>

      <!-- 홈으로 이동 -->
      <button class="icon-btn" @click="goHome">
        <span class="material-icons">home</span>
      </button>
    </div>

    <!-- 가운데 로고 -->
    <div class="logo" @click="goHome">
      운동의 민족
    </div>

    <div class="right-area">

      <!-- 마이페이지 -->
      <button class="icon-btn" @click="goMyPage">
        <span class="material-icons">person</span>
      </button>
    </div>

  </header>
</template>

<script setup>
import { useRouter } from "vue-router";
const router = useRouter();

const goHome = () => router.push("/");
const goBack = () => router.back();
const goMyPage = () => router.push("/profile");

// 🔥 추천 기능: 알림 페이지(없으면 라우터만 만들어두면 됨)
const goNotifications = () => router.push("/notifications");
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

/* 전체 헤더 스타일 */
.header {
  position: fixed;
  top: 0;
  left: 0;

  width: 100%;
  padding: 20px 5%;
  display: flex;
  justify-content: space-between; /* 좌우 버튼 배치용 */
  align-items: center;

  border-bottom: 1px solid rgba(255,255,255,0.1);
  background: #000;
  z-index: 999;
  box-sizing: border-box;

  position: relative; /* absolute 요소 기준 */
}

/* 좌/우 버튼 그룹 */
.left-area, .right-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 🔥 중앙 로고 */
.logo {
  position: absolute;       /* 진짜 중앙 배치 */
  left: 50%;
  transform: translateX(-50%);
  top: 50%;
  transform: translate(-50%, -50%);  /* 세로까지 정확히 중앙 */

  font-size: 22px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
}

/* 아이콘 버튼 스타일 */
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  color: #fff;

  display: flex;
  align-items: center;
  justify-content: center;
}

.material-icons {
  font-size: 26px;
}
</style>

