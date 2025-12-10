<template>
  <div class="home" :class="{ 'logged-in': auth.accessToken }">

    <!-- FEATURES -->
    <section class="features">
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

    <!-- HERO — 로그인 안하면 출력 -->
    <section class="hero" v-if="!auth.accessToken">
      <h1>운동의 민족</h1>
      <p>대한민국 No.1 운동 플랫폼</p>
      <button class="btn-red big" @click="goLogin">로그인</button>
    </section>

    <!-- TEMPLATE MARKET HEADER -->
    <div class="page-title-row">
      <div class="page-title-main">
        <h1>오늘 운동 루틴, 템플릿으로 바로 가져가볼까요? 💪</h1>
        <p>인기 있는 운동 루틴 템플릿을 한 곳에서 보고, 내 기록장에 바로 적용해보세요.</p>
      </div>

      <button class="cta-sell-btn">템플릿 판매 시작하기 ➜</button>
    </div>

    <!-- TABS -->
    <div class="tabs-row">
      <div class="tabs">
        <div class="tab active">🔥 인기</div>
        <div class="tab">🆕 최신</div>
        <div class="tab">💪 상체</div>
        <div class="tab">🦵 하체</div>
        <div class="tab">⚡ 전신</div>
      </div>

      <div class="filters">
        <div class="chip highlight">무료만 보기</div>
        <div class="chip">초보자용</div>
        <div class="chip">헬스장</div>
        <div class="chip">홈트</div>
      </div>
    </div>

    <!-- TEMPLATE GRID (3x2 per page) -->
    <section class="grid">
      <article
        class="card-template"
        v-for="item in paginatedData"
        :key="item.id"
        @click="goTemplateDetail(item.id)"
      >
        <div class="thumb">
          <span class="thumb-tag">{{ item.tag }}</span>
          <span class="thumb-label">{{ item.label }}</span>

          <span class="price-badge" v-if="item.price > 0">₩{{ item.price }}</span>
          <span class="price-badge" v-else>무료</span>
        </div>

        <div class="card-body">
          <div class="template-title">{{ item.title }}</div>

          <!-- 판매량으로 변경 -->
          <div class="template-creator">
            by {{ item.creator }} | 판매량 {{ item.level }}
          </div>

          <!-- 등록 날짜 (하트 위쪽) -->
          <div class="template-date">
            등록일: {{ item.date }}
          </div>

          <div class="meta-row">
            <div class="tags">
              <span class="tag" v-for="t in item.tags" :key="t">{{ t }}</span>
            </div>

            <!-- 다운로드 제거 → 하트만 표시 -->
            <div class="stats">
              <div class="stat-item">❤️ {{ item.like }}</div>
            </div>
          </div>

          <div class="buy-row">
            <span :class="{ free: item.price === 0 }" class="price-text">
              {{ item.price === 0 ? '무료' : '₩' + item.price }}
            </span>

            <button class="buy-btn">
              {{ item.price === 0 ? '내 기록장에 추가' : '구매하기' }}
            </button>
          </div>
        </div>
      </article>
    </section>

    <!-- PAGINATION -->
    <div class="pagination">
      <button
        v-for="p in totalPages"
        :key="p"
        :class="{ active: p === page }"
        @click="goPage(p)"
      >
        {{ p }}
      </button>
    </div>

  </div>
</template>

<script>
import { useAuthStore } from "@/stores/authStore"

export default {
  name: "HomeView",

  data() {
    return {
      page: 1,
      pageSize: 6,

      templates: Array.from({ length: 30 }).map((_, i) => ({
        id: i + 1,
        date: `2025-01-${String((i % 28) + 1).padStart(2, "0")}`, // 등록날짜 추가
        tag: "전신 • 루틴",
        label: "Routine " + (i + 1),
        title: `템플릿 제목 ${i + 1}`,
        creator: "Creator" + (i + 1),
        level: "⭐⭐⭐", // 별은 유지
        price: (i % 3 === 0 ? 0 : 4900),
        tags: ["헬스장", "운동"],
        like: 100 + i
      }))
    }
  },

  computed: {
    auth() {
      return useAuthStore()
    },

    totalPages() {
      return Math.ceil(this.templates.length / this.pageSize)
    },

    paginatedData() {
      const start = (this.page - 1) * this.pageSize
      return this.templates.slice(start, start + this.pageSize)
    }
  },

  methods: {
    goLogin() {
      this.$router.push("/login")
    },
    goToRecord() {
      this.$router.push("/month")
    },
    goTemplateDetail(id) {
      this.$router.push(`/template/${id}`)
    },
    goPage(p) {
      this.page = p
    }
  }
}
</script>

<style scoped>

/* 로그인 시 HERO 사라진 뒤 여백 조정 */
.home.logged-in .page-title-row {
  margin-top: 30px !important;
}

/* FEATURES */
.features {
  padding: 20px 5%;
  display: flex;
  gap: 20px;
  justify-content: center;
}
.feature-card {
  background: #0a0a0a;
  padding: 30px;
  width: 300px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.15);
  transition: .2s;
  cursor: pointer;
  color: white;
}
.feature-card:hover {
  border-color: #e60023;
  transform: translateY(-5px);
}

/* HERO */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.hero h1 {
  font-size: 64px;
  font-weight: 700;
}
.hero p {
  font-size: 18px;
  opacity: 0.8;
  margin-top: 10px;
}
.btn-red {
  padding: 14px 28px;
  background: #e60023;
  border-radius: 6px;
  color: white;
  font-weight: bold;
}
.big {
  font-size: 20px;
  margin-top: 30px;
}

/* TEMPLATE HEADER */
.page-title-row {
  display: flex;
  justify-content: space-between;
  padding: 0 5%;
  margin-top: 80px;
  align-items: center;
}
.cta-sell-btn {
  padding: 8px 16px;
  height: 36px;
  border-radius: 999px;
  background: #e60023;
  color: white;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}

/* TABS */
.tabs-row {
  padding: 0 5%;
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.tabs {
  display: flex;
  gap: 10px;
}
.tab {
  padding: 6px 12px;
  background: rgba(255,255,255,0.1);
  border-radius: 999px;
}
.tab.active {
  background: white;
  color: black;
  font-weight: bold;
}
.filters {
  display: flex;
  gap: 8px;
}
.chip {
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.2);
}

/* GRID 3×2 */
.grid {
  padding: 30px 5%;
  display: grid;

  /* 한 줄 3개 고정 + 반응형 너비 */
  grid-template-columns: repeat(3, 1fr);

  gap: 20px;
}

.card-template {
  width: 100%;          /* 1fr 크기만큼 자연스러운 반응형 */
  background: #101016;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 12px;
  transition: .2s;
  cursor: pointer;
}
.card-template:hover {
  transform: translateY(-4px);
  border-color: rgba(255,255,255,0.2);
}

.thumb {
  height: 150px;
  background: #1a1a1a;
  border-radius: 12px;
  position: relative;
}
.thumb-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 3px 8px;
  background: rgba(0,0,0,0.6);
  border-radius: 999px;
  font-size: 11px;
}
.price-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 4px 8px;
  font-size: 11px;
  border-radius: 999px;
  background: #e60023;
  color: white;
}

.template-title {
  margin-top: 10px;
  font-size: 14px;
  font-weight: bold;
}
.template-creator {
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.75;
}

/* 등록 날짜 */
.template-date {
  font-size: 11px;
  opacity: 0.7;
  margin: 4px 0;
}

/* TAGS + HEART */
.meta-row {
  margin-top: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.tags {
  display: flex;
  gap: 4px;
}
.tag {
  padding: 3px 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 6px;
  font-size: 10px;
}
.stats {
  font-size: 11px;
  display: flex;
  align-items: center;
}

/* BUY ROW */
.buy-row {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
}
.buy-btn {
  padding: 6px 12px;
  border-radius: 999px;
  background: white;
  color: black;
  font-size: 11px;
  font-weight: bold;
}
.price-text.free {
  color: #11c46b;
}

/* PAGINATION */
.pagination {
  padding: 30px 50px;
  display: flex;
  justify-content: center;
  gap: 10px;
}
.pagination button {
  background: rgba(255,255,255,0.1);
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  color: white;
}
.pagination button.active {
  background: #e60023;
  font-weight: bold;
}
</style>
