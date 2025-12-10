<template>
  <div class="detail-page">

    <!-- HEADER BAR -->
    <HeaderBar />

    <!-- 🔥 TOP: 1 : 2 비율 -->
    <section class="top-section">

      <!-- LEFT 1 -->
      <div class="top-left">
        <div class="seller-profile">
          <img class="profile-img" :src="template.sellerProfileImg" />
          <div class="seller-info">
            <h2>{{ template.creator }}</h2>
            <p class="seller-name">{{ template.awards }}</p>
          </div>

          <!-- ❤️ 추천 하트 + 카운트 (UI 레이아웃 최소 변경) -->
          <div class="like-row">
            <span class="heart-icon" @click="toggleLike">
              <!-- 빈 하트 -->
              <svg
                v-if="!liked"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.07-4.312 2.622C11.285 4.82 9.623 3.75 7.688 3.75 5.099 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>

              <!-- 빨간 하트 -->
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path
                  fill="red"
                  d="M12 20.25s-9-4.78-9-12A4.76 4.76 0 0 1 7.688 3.75c1.935 0 3.597 1.07 4.312 2.622C12.715 4.82 14.377 3.75 16.312 3.75A4.76 4.76 0 0 1 21 8.25c0 7.22-9 12-9 12z"
                />
              </svg>
            </span>
            <span class="like-count">{{ likeCount }}</span>
          </div>
        </div>
      </div>

      <!-- RIGHT 2 -->
      <div class="top-right">
        <img class="template-img" :src="template.thumbnail" />
      </div>

    </section>

    <!-- 🔥 BOTTOM: 3 : 1 비율 -->
    <section class="bottom-section">

      <!-- LEFT 3 -->
      <div class="bottom-left">

        <!-- 템플릿 설명 -->
        <p class="description">
          {{ template.description }}
        </p>

        <!-- 🔥 NEW: 수강 후 얻을 수 있는 것 -->
        <div class="benefit-section">
          <h3 class="benefit-title">수강 후 이런걸 얻을 수 있어요</h3>

          <div class="benefit-box">
            <div class="benefit-item">
              <span class="check">✔</span>
              좋은 운동 루틴을 스스로 구성할 수 있는 기준이 생깁니다.
            </div>

            <div class="benefit-item">
              <span class="check">✔</span>
              7일 분할 루틴을 반복하며 운동 습관이 형성됩니다.
            </div>

            <div class="benefit-item">
              <span class="check">✔</span>
              자신의 체력에 맞는 난이도와 강도를 이해하게 됩니다.
            </div>
          </div>
        </div>

      </div>

      <!-- RIGHT 1 (SELL BOX) -->
      <div class="sell-box">

        <!-- 가격 표시 -->
        <h2 class="sell-price">
          {{ template.price === 0 ? "무료" : `₩${template.price}` }}
        </h2>

        <!-- 구매 버튼 -->
        <button class="buy-btn" @click="showBuyModal = true">
          구매하기
        </button>

        <!-- 기본 메타 -->
        <div class="sell-meta">
          <p>📅 등록날짜: {{ template.date }}</p>
          <p>🔥 판매량: {{ template.salesCount }}회 {{ starLevel }}</p>
          <!-- ❤️ 기존 likes 대신 likeCount 사용 -->
          <p>❤️ {{ likeCount }}</p>
        </div>

        <hr class="divider" />

        <div class="info-table">
          <div class="row">
            <span class="label">카테고리</span>
            <span>{{ template.category }}</span>
          </div>
          <div class="row">
            <span class="label">구성</span>
            <span>7일 분할 운동 루틴</span>
          </div>
          <div class="row">
            <span class="label">운동시간</span>
            <span>{{ template.duration }}</span>
          </div>
          <div class="row">
            <span class="label">난이도</span>
            <span>{{ template.level }}</span>
          </div>
        </div>

        <div class="notice-box">
          이 템플릿은 코치가 직접 제작하여 제공하는 운동 루틴입니다.
        </div>

      </div>
    </section>

    <!-- 🔥 구매 모달 -->
    <TemplateBuyModal
      v-if="showBuyModal"
      :templateTitle="template.title"
      :price="template.price"
      @close="showBuyModal = false"
      @confirm="purchaseTemplate"
    />

  </div>
</template>

<script>
import axios from "@/api/axios.js";
import HeaderBar from "@/components/HeaderBar.vue";
import TemplateBuyModal from "./TemplateBuyModal.vue";

export default {
  name: "TemplateDetailView",
  components: { HeaderBar, TemplateBuyModal },
  props: ["id"],

  data() {
    return {
      showBuyModal: false, // 구매 모달 상태
      liked: false,        // ❤️ 하트 on/off
      likeCount: 0,        // ❤️ 표시할 추천 수
      template: {
        id: null,
        title: "",
        creator: "",
        sellerProfileImg: "",
        awards: "IFBB 아마추어 1위 · 국내 챔피언십 TOP3 · 10년 경력 PT 전문가",
        price: 0,
        likes: 0,
        salesCount: 0,
        category: "",
        structure: "",
        duration: "",
        level: "",
        thumbnail: "",
        description: "",
        date: "2025-01-12"
      },
      starLevel: ""
    };
  },

  async mounted() {
    await this.fetchTemplateDetail(this.id);
  },

  methods: {
    async fetchTemplateDetail(id) {
      try {
        const res = await axios.get(`/api/templates/${id}`);
        // 기존 동작 유지: 백엔드 응답을 그대로 template에 넣음
        this.template = res.data;

        // ❤️ 하트 상태/카운트 초기화
        this.likeCount = Number(this.likeCount) || 0;
        // 백엔드에 recommended 플래그가 있으면 사용, 없으면 기본 false
        this.liked = !!this.template.recommended;

        this.starLevel = this.convertStars(this.template.salesCount);
      } catch (err) {
        console.error(err);
        this.template = this.getFallback(id);

        // fallback에서도 좋아요 초기값 세팅
        this.likeCount = this.likeCount || 0;
        this.liked = false;

        this.starLevel = this.convertStars(this.template.salesCount);
      }
    },

    convertStars(n) {
      if (n < 50) return "⭐";
      if (n < 150) return "⭐⭐";
      if (n < 300) return "⭐⭐⭐";
      if (n < 500) return "⭐⭐⭐⭐";
      return "⭐⭐⭐⭐⭐";
    },

    getFallback(id) {
      return {
        id,
        title: `${id}번 템플릿`,
        creator: "Coach_J",
        awards: "IFBB 아마추어 1위 · 국내 챔피언십 TOP3 · 10년 경력 PT 전문가",
        sellerProfileImg: "https://i.pravatar.cc/150?img=12",
        price: id % 2 === 0 ? 0 : 9900,
        likes: 100 + id,
        salesCount: 200,
        category: "전신 루틴",
        structure: "7일 루틴",
        duration: "45~60분",
        level: "초보~중급",
        thumbnail:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
        description: "임시 템플릿 설명입니다.",
        date: "2025-01-12"
      };
    },

    // ❤️ 하트 토글 (UI + 카운트만 우선 구현, API는 나중에 붙여도 됨)
    async toggleLike() {
      const prevLiked = this.liked;
      const prevCount = this.likeCount;

      // Optimistic UI
      this.liked = !this.liked;
      this.likeCount += this.liked ? 1 : -1;

      try {
        // 백엔드 추천 API 연동 시 이렇게 연결 가능 (필요할 때 열면 됨)
        /*
        if (this.liked) {
          await axios.post(`/api/v1/templates/${this.template.id}/recommend`);
        } else {
          await axios.delete(`/api/v1/templates/${this.template.id}/recommend`, {
            params: { userId: 1 } // 실제 로그인 유저 ID로 교체
          });
        }
        */
      } catch (err) {
        console.error("추천 API 오류", err);
        // 실패 시 롤백
        this.liked = prevLiked;
        this.likeCount = prevCount;
      }
    },

    // 구매 처리 (실제 API 연결은 추후)
    purchaseTemplate() {
      alert("구매 API 연결 예정");
      this.showBuyModal = false;
    }
  }
};
</script>

<style scoped>
.detail-page {
  padding: 40px 5% 40px;
  color: white;
}

/* ------------------ TOP 1:2 ------------------ */
.top-section {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 40px;
  height: 50vh;
}

.top-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.seller-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.profile-img {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 14px;
}

.seller-name {
  opacity: 0.8;
  font-size: 14px;
  margin-top: 6px;
}

/* ❤️ 하트 영역 */
.like-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  font-size: 14px;
}

.heart-icon {
  width: 26px;
  height: 26px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.heart-icon svg {
  width: 100%;
  height: 100%;
}

.like-count {
  min-width: 20px;
  text-align: left;
}

/* RIGHT IMAGE */
.top-right {
  display: flex;
  justify-content: center;
  align-items: center;
}

.template-img {
  width: 90%;
  max-height: 50vh;
  object-fit: cover;
  border-radius: 14px;
}

/* ------------------ BOTTOM 3:1 ------------------ */
.bottom-section {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 40px;
  margin-top: 40px;
  align-items: start;
}

/* 템플릿 소개 */
.description {
  opacity: 0.9;
  line-height: 1.7rem;
}

/* BENEFIT SECTION */
.benefit-section {
  margin-top: 40px;
}

.benefit-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 14px;
}

.benefit-box {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.15);
  padding: 18px 20px;
  border-radius: 10px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 14px;
}

.benefit-item:last-child {
  margin-bottom: 0;
}

.check {
  color: #00c3ff;
  font-weight: 900;
  font-size: 16px;
}

/* SELL BOX */
.sell-box {
  background: #111;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.15);
}

.sell-price {
  font-size: 28px;
  margin-bottom: 14px;
}

.buy-btn {
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  background: #e60023;
  color: white;
  font-weight: bold;
  margin-bottom: 16px;
}

.sell-meta p {
  margin: 4px 0;
}

/* INFO TABLE */
.info-table .row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.label {
  opacity: 0.7;
}

.notice-box {
  margin-top: 16px;
  opacity: 0.7;
}
</style>
