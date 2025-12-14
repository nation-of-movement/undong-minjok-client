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

  display: flex;
  flex-direction: column;
  color: #fff;
}

/* 고정 헤더 때문에 content 영역을 아래로 밀기 */
.content {
  flex: 1;
  padding: 40px 5%;
  padding-top: 120px;
}

/* footer는 자연스럽게 아래 따라오게 */
.footer {
  padding: 30px;
  text-align: center;
  font-size: 14px;
  opacity: 0.5;
  flex-shrink: 0;
}
</style>
