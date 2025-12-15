<template>
  <div class="detail-page">
    <!-- HEADER BAR -->
    <HeaderBar />


    <!-- TOP: 1 : 2 비율 -->
    <section class="top-section">
      <!-- LEFT 1 -->
      <div class="top-left">
        <div class="seller-profile">
          <img class="profile-img" :src="template.sellerProfileImg" />
          <div class="seller-info">
            <h2>{{ template.creator }}</h2>
            <p class="seller-name" v-if="template.bio">
              {{ template.bio }}
            </p>
          </div>

          <!-- 추천 하트 + 카운트 -->
          <div class="like-row">
            <span class="heart-icon" @click="toggleLike">
              <svg v-if="!liked" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.07-4.312 2.622C11.285 4.82 9.623 3.75 7.688 3.75 5.099 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>

              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
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

        <div class="benefit-section">
          <h3 class="benefit-title">수강 후 이런걸 얻을 수 있어요</h3>

          <div class="benefit-box">
            <div class="benefit-item" v-for="(line, idx) in benefitLines" :key="idx">
              <span class="check">✔</span> {{ line }}
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT 1 (SELL BOX) -->
      <div class="sell-box">
        <h2 class="sell-price">
          {{ template.price === 0 ? '무료' : `₩${template.price}` }}
        </h2>

        <!-- 구매 버튼 조건문 적용 -->
        <button
          class="buy-btn"
          :disabled="template.isOwner || template.isPurchased"
          @click="onClickBuy"
        >
          {{
            template.isOwner
              ? '내가 만든 템플릿입니다'
              : template.isPurchased
                ? '구매한 템플릿입니다'
                : '구매하기'
          }}
        </button>

        <div class="sell-meta">
          <p>📅 등록날짜: {{ template.date }}</p>
          <p>🔥 판매량: {{ template.salesCount }}회 {{ starLevel }}</p>
          <p>❤️ {{ likeCount }}</p>
        </div>

        <hr class="divider" />

        <div class="info-table">
          <div class="row">
            <span class="label">카테고리</span><span>{{ template.category }}</span>
          </div>
          <div class="row"><span class="label">구성</span><span>7일 분할 운동 루틴</span></div>
          <div class="row">
            <span class="label">운동시간</span><span>{{ template.duration }}</span>
          </div>
          <div class="row">
            <span class="label">난이도</span><span>{{ template.level }}</span>
          </div>
        </div>

        <div class="notice-box">이 템플릿은 코치가 직접 제작하여 제공하는 운동 루틴입니다.</div>
      </div>
    </section>

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
import { templateApi } from '@/api/axios'
import HeaderBar from '@/components/HeaderBar.vue'
import TemplateBuyModal from './TemplateBuyModal.vue'

export default {
  name: 'TemplateDetailView',
  components: { HeaderBar, TemplateBuyModal },
  props: ['id'],

  data() {
    return {
      BASE_URL: import.meta.env.VITE_IMG_BASE_URL,

      showBuyModal: false,
      liked: false,
      likeCount: 0,

      template: {
        id: null,
        title: '',
        creator: '',
        sellerProfileImg: '',
        bio: '',
        price: 0,
        likes: 0,
        salesCount: 0,
        category: '',
        structure: '',
        duration: '',
        level: '',
        thumbnail: '',
        description: '',
        date: '',
        isOwner: false,
        isPurchased: false,

      },

      starLevel: '',
    }
  },

  computed: {
    benefitLines() {
      if (!this.template.description) return []
      return this.template.description
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
    },
  },

  async mounted() {
    await this.fetchTemplateDetail(this.id)
  },

  methods: {
    onClickBuy() {
      if (this.template.isOwner || this.template.isPurchased) return
      this.showBuyModal = true
    },
    async fetchTemplateDetail(id) {
      try {
        const res = await templateApi.getDetail(id)
        const d = res.data.data

        // DTO → 화면용 데이터 매핑
        this.template.id = d.id
        this.template.title = d.name
        this.template.description = d.content
        this.template.thumbnail = d.templateImage
          ? this.BASE_URL + d.templateImage
          : this.BASE_URL + d.thumbnailImage
        this.template.creator = d.writerNickname
        this.template.bio = d.userProfile?.bio || ''

        this.template.isOwner = d.isMine
        this.template.isPurchased = d.isPurchased
        this.template.price = d.price
        this.template.salesCount = d.salesCount
        this.template.category = d.category || ''
        this.template.duration = d.duration || ''
        this.template.level = d.level || ''

        this.template.date = d.createdAt?.split('T')[0] || this.template.date

        this.template.sellerProfileImg = d.userProfile?.profileImagePath
          ? this.BASE_URL + d.userProfile.profileImagePath
          : '/default-profile.png'

        // 추천 정보 세팅
        this.likeCount = d.recommendCount || 0
        this.liked = d.recommended || false

        // ⭐ 별점
        this.starLevel = this.convertStars(this.template.salesCount)
      } catch (err) {
        console.error('템플릿 조회 오류', err)
      }
    },

    convertStars(n) {
      if (n < 50) return '⭐'
      if (n < 150) return '⭐⭐'
      if (n < 300) return '⭐⭐⭐'
      if (n < 500) return '⭐⭐⭐⭐'
      return '⭐⭐⭐⭐⭐'
    },

    async toggleLike() {
      const prevLiked = this.liked
      const prevCount = this.likeCount

      // Optimistic UI
      this.liked = !this.liked
      this.likeCount += this.liked ? 1 : -1

      try {
        if (this.liked) {
          await templateApi.recommend(this.template.id)
        } else {
          await templateApi.unRecommend(this.template.id)
        }
      } catch (err) {
        console.error('추천/취소 실패', err)
        this.liked = prevLiked
        this.likeCount = prevCount
      }
    },

    async purchaseTemplate() {
      try {
        if (this.template.isOwner) {
          alert('본인이 만든 템플릿은 구매할 수 없습니다.')
          this.showBuyModal = false
          return
        }

        const id = this.template.id
        await templateApi.purchase(id)

        alert('구매가 완료되었습니다!')
        this.template.isPurchased = true

        this.showBuyModal = false

        this.$router.push('/templates/storage')
      } catch (err) {
        console.error('구매 실패', err)

        const msg =
          err.response?.data?.message || err.customMessage || '구매 중 오류가 발생했습니다.'

        alert(msg)

        this.showBuyModal = false
      }
    },
  },
}
</script>

<style scoped>
/* --------------- 기존 CSS 그대로 유지 --------------- */

.detail-page {
  padding-top: 60px;
  padding-left: 5%;
  padding-right: 5%;
  padding-bottom: 40px;
  color: white;
}
.top-section {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 40px;
  min-height: 50vh;
  padding-top: 40px;
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
}

.heart-icon svg {
  width: 100%;
  height: 100%;
}

.like-count {
  min-width: 20px;
  text-align: left;
}

.top-right {
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-img {
  max-width: 100%;
  width: 100%;
  height: auto;
  max-height: 70vh;
  object-fit: contain;
}

.bottom-section {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 40px;
  margin-top: 40px;
  align-items: start;
}

.description {
  opacity: 0.9;
  line-height: 1.7rem;
}

.benefit-section {
  margin-top: 40px;
}

.benefit-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 14px;
}

.benefit-box {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
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

.check {
  color: #00c3ff;
  font-weight: 900;
  font-size: 16px;
}

.sell-box {
  background: #111;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
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

.benefit-list {
  margin-top: 20px;
}

.benefit-item {
  margin-bottom: 6px;
  font-size: 15px;
  line-height: 1.5;
}
</style>
