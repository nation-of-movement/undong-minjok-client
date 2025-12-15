<template>
  <div class="home" :class="{ 'logged-in': auth.accessToken }">

    <!-- FEATURES -->
    <section class="features">
      <div class="feature-card" @click="goToRecord">
        <h3>🏋️ 기록하러 가기</h3>
        <p>오늘의 운동을 기록하러 가보세요!</p>
      </div>

      <div class="feature-card"  @click="goToCharge">
        <h3>💳 충전하기</h3>
        <p>프리미엄 기능을 지금 바로 이용해보세요.</p>
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

      <button class="cta-sell-btn" @click="openCreateModal">
        템플릿 등록하기 ➜
      </button>
    </div>

    <!-- ⭐ 검색바 + 정렬 탭 같은 라인 -->
    <div class="search-sort-row">
      <!-- 검색바 -->
      <input
        class="search-input"
        v-model="search"
        @input="fetchTemplates"
        placeholder="템플릿을 검색해주세요"
      />

      <!-- 정렬 탭 -->
      <div class="tabs">
        <div
          class="tab"
          :class="{ active: sort === 'RECOMMEND' }"
          @click="changeSort('RECOMMEND')"
        >
          🔥 추천순
        </div>

        <div
          class="tab"
          :class="{ active: sort === 'LATEST' }"
          @click="changeSort('LATEST')"
        >
          🆕 등록순
        </div>

        <div
          class="tab"
          :class="{ active: sort === 'SALES' }"
          @click="changeSort('SALES')"
        >
          💪 판매순
        </div>
      </div>
    </div>

    <!-- TEMPLATE GRID -->
    <section class="grid">
      <article
        class="card-template"
        v-for="item in paginatedData"
        :key="item.id"
        @click="goTemplateDetail(item.id)"
      >
        <div class="thumb">
          <img :src="item.thumbnailImage" class="thumb-img" />

          <span class="thumb-tag">{{ item.tag }}</span>
          <span class="thumb-label">{{ item.label }}</span>

        </div>

        <div class="card-body">
          <div class="template-title">{{ item.title }}</div>

          <div class="template-creator">
            by {{ item.creator }} | 판매량 {{ item.salesCount }}
          </div>

          <div class="template-date">
            등록일: {{ item.date }}
          </div>

          <div class="meta-row">
            <div class="tags">
              <span class="tag" v-for="t in item.tags" :key="t">{{ t }}</span>
            </div>

            <div class="stats">
              <div class="stat-item">❤️ {{ item.like }}</div>
              <div class="price-text">
                {{ item.price === 0 ? '무료' : '₩' + item.price }}
            </div>
            </div>
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

    <!-- TEMPLATE CREATE MODAL -->
    <CreateTemplateModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @success="onTemplateCreated"
    />

  </div>
</template>

<script>
import { useAuthStore } from "@/stores/authStore"
import TemplateList from "@/pages/templates/TemplateList.vue";
import CreateTemplateModal from "@/pages/templates/CreateTemplateModal.vue";
import { templateApi } from "@/api/axios";
import { useRouter } from 'vue-router'

export default {
  name: "HomeView",

  components: { TemplateList, CreateTemplateModal },

  data() {
    return {
      page: 1,
      pageSize: 6,
      templates: [],
      showCreateModal: false,

      search: "",
      sort: "SALES",
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
      this.$router.push(`/templates/${id}`)
    },

    goPage(p) {
      this.page = p
    },

    openCreateModal() {
      this.showCreateModal = true;
    },

    goToCharge() {
      this.$router.push("/point-charge")
    },

    async fetchTemplates() {
      try {
        const res = await templateApi.getPage({
          page: this.page - 1,
          size: this.pageSize,
          name: this.search,
          sort: this.sort
        });

        const url = import.meta.env.VITE_IMG_BASE_URL;
        const list = res.data.data.content;

        this.templates = list.map(t => ({
          id: t.id,
          title: t.name,
          creator: t.writerNickname ?? "Unknown",
          salesCount: t.salesCount ?? 0,
          price: t.price,
          thumbnailImage: url + t.thumbnailImage,
          date: t.createdAt ? t.createdAt.split("T")[0] : "",
          tags: [],
          like: t.recommendCount ?? 0,
        }));

      } catch (e) {
        console.error("템플릿 로딩 실패:", e);
      }
    },

// 정렬 변경 시 자동 새로고침
    async changeSort(type) {
      this.sort = type;
      this.page = 1;       // 정렬 바꾸면 첫 페이지로 이동
      await this.fetchTemplates();
    },

// 기존 loadTemplates 유지하면서 내부는 fetchTemplates 호출
    async loadTemplates() {
      await this.fetchTemplates();
    },

    async onTemplateCreated() {
      this.showCreateModal = false;
      await this.loadTemplates();
    },
  },

  async mounted() {
    await this.loadTemplates();
  }
};
</script>

<style scoped>
.home {
  padding-top: 80px;
}

/* 검색바 + 정렬탭 같은 줄 */
.search-sort-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 5% 0 5%;
}

/* 검색 input */
.search-input {
  width: 340px;
  height: 44px;
  padding: 0 15px;
  background: #0f0f0f;
  color: white;
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 10px;
  font-size: 15px;
}

.search-input::placeholder {
  color: rgba(255,255,255,0.45);
}

/* 탭 */
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

/* 기존 코드 전부 유지 (생략 없음) */
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

/* 페이지 헤더 */
.page-title-row {
  display: flex;
  justify-content: space-between;
  padding: 0 5%;
  margin-top: 50px;
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
}

/* GRID */
.grid {
  padding: 30px 5%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.card-template {
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
  width: 100%;
  height: 150px;
  background: inherit;

  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  overflow: hidden;
}

.thumb-img {
  max-width: 100%;
  max-height: 100%;

  width: auto;
  height: auto;

  object-fit: contain;
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

.template-date {
  font-size: 11px;
  opacity: 0.7;
  margin: 4px 0;
}

.meta-row {
  margin-top: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.buy-row {
  margin-top: 10px;
}

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
  color: white;
}
.pagination button.active {
  background: #e60023;
  font-weight: bold;
}

.stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.price-text {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.85;
}
</style>
