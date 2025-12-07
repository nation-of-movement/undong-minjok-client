<template>
  <div class="layout">
    <HeaderBar />

    <main class="content">
      <router-view />
    </main>

    <footer class="footer">
      © 2025 운동의 민족. All rights reserved.
    </footer>
  </div>
</template>

<script setup>
import HeaderBar from "@/components/HeaderBar.vue";
</script>

<style scoped>
.layout {
  background: #000;
  min-height: 100vh;
  color: #fff;
}

/* 고정 헤더 때문에 content 영역을 아래로 밀기 */
.content {
  padding: 40px 5%;
  padding-top: 120px; /* 헤더 높이만큼 내려줌 */
  min-height: calc(100vh - 160px);
}

/* footer는 자연스럽게 아래 따라오게 */
.footer {
  padding: 30px;
  text-align: center;
  font-size: 14px;
  opacity: 0.5;
}
</style>
