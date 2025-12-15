<script setup>
import { useAuthStore } from "@/stores/authStore";
const auth = useAuthStore();
</script>

<template>
  <header class="header">
    <RouterLink to="/" class="logo">
      운동의 민족
    </RouterLink>

    <nav class="nav">

      <template v-if="auth.user">
        <RouterLink to="/profile">내 정보</RouterLink>

        <button @click="auth.logout" class="btn-red logout-btn">로그아웃</button>
      </template>

      <template v-else>
        <RouterLink to="/login" class="btn-red">로그인</RouterLink>
      </template>
    </nav>
  </header>
</template>

<style scoped>
.nav {
  display: flex;
  align-items: center;
}

.logout-btn {
  margin-left: 20px; /* 숫자 조절 가능 */
}

.header {
  position: fixed;
  top: 0;
  left: 0;

  width: 100%;
  padding: 20px 5%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  border-bottom: 1px solid rgba(255,255,255,0.1);
  background: #000; /* fixed일 때 배경색 필수 */
  z-index: 999; /* 위로 올리기 */
  box-sizing: border-box;
}


.logo {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
}

.nav a {
  margin-left: 25px;
  text-decoration: none;
  color: #fff;
  font-weight: 400;
}

.btn-red {
  padding: 8px 16px;
  background: #E60023;
  border-radius: 6px;
  font-weight: 600;
}
</style>
