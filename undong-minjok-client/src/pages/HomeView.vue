<template>
  <section class="hero">
    <h1>운동의 민족</h1>
    <p>대한민국 No.1 운동 플랫폼</p>
    <button class="btn-red big">시작하기</button>
  </section>

  <section class="features">
    <!-- 기록하러 가기 -->
    <div class="feature-card" @click="goToRecord">
      <h3>🏋️ 기록하러 가기</h3>
      <p>오늘의 운동을 기록하러 가보세요!</p>
    </div>

    <div class="feature-card">
      <h3>🔥 챌린지 참여</h3>
      <p>운동 기록하고 랭킹에 도전하세요.</p>
    </div>

    <div class="feature-card">
      <h3>💬 커뮤니티</h3>
      <p>운동하는 사람들과 실시간으로 소통하세요.</p>
    </div>
  </section>
</template>

<script>
export default {
  name: "HomeView",

  methods: {
    goToRecord() {
      this.$router.push("/month");
    }
  }
}
</script>

<style scoped>
.hero {
  height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.hero h1 {
  font-size: 64px;
  font-weight: 700;
  color: #fff;
}

.hero p {
  margin-top: 10px;
  font-size: 18px;
  opacity: 0.8;
}

.btn-red {
  padding: 14px 28px;
  background: #E60023;
  border-radius: 6px;
  font-weight: 700;
}

.big {
  margin-top: 30px;
  font-size: 20px;
}

.features {
  padding: 60px 5%;
  display: flex;
  gap: 20px;
  justify-content: center;
}

.feature-card {
  background: #0a0a0a;
  padding: 30px;
  width: 300px;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 12px;
  transition: all .3s ease;
  color: #fff;
}

.feature-card:hover {
  border-color: #E60023;
  transform: translateY(-5px);
}
</style>
