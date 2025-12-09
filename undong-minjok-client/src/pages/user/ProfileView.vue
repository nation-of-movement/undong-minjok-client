<!-- src/views/MyPage.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import {
  getMyInfoApi,
  updateNicknameApi,
  updateBioApi,
  uploadProfileImageApi,
} from '@/api/userApi'

const auth = useAuthStore()
const IMAGE_BASE_URL = import.meta.env.VITE_IMG_BASE_URL

const loading = ref(true)
const userInfo = ref({
  loginId: '',
  nickname: '',
  email: '',
  profileImagePath: null,
  amount: 0,
})

// UI 편집 값
const nickname = ref('')
const bio = ref('')
const profileImageUrl = ref(null)

const activeMenu = ref('info')
const menus = [
  { key: 'info', label: '내 정보' },
  { key: 'points', label: '포인트 이력' },
  { key: 'purchases', label: '구매 내역' },
  { key: 'sales', label: '판매 내역' },
]

/* ================================
 *  초기 데이터 로드
 * ================================ */
const fetchMyInfo = async () => {
  loading.value = true
  try {
    const res = await getMyInfoApi()
    const data = res.data.data

    userInfo.value = data
    nickname.value = data.nickname
    bio.value = data.bio || ''
    profileImageUrl.value = IMAGE_BASE_URL + data.profileImagePath

    // auth.user에도 덮어쓰기
    auth.user = {
      ...auth.user,
      ...data,
    }
  } catch (e) {
    console.error('내 정보 로드 실패', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMyInfo()
})

/* ================================
 * 닉네임 변경
 * ================================ */
const savingNickname = ref(false)
const handleSaveNickname = async () => {
  if (!nickname.value.trim()) {
    return
  }

  savingNickname.value = true
  try {
    await updateNicknameApi(nickname.value.trim())
    await fetchMyInfo() // 최신 정보 재반영
    alert('닉네임이 변경되었습니다.')
  } catch (e) {
    const msg = e.response?.data?.message || '닉네임 변경 실패'
    alert(msg)
  } finally {
    savingNickname.value = false
  }
}

/* ================================
 * 자기소개 변경
 * ================================ */
const savingBio = ref(false)
const handleSaveBio = async () => {
  savingBio.value = true
  try {
    await updateBioApi(bio.value)
    await fetchMyInfo()
    alert('자기소개가 변경되었습니다.')
  } catch {
    alert('자기소개 변경 실패')
  } finally {
    savingBio.value = false
  }
}

/* ================================
 * 프로필 이미지 업로드
 * ================================ */
const uploadingImage = ref(false)
const fileInput = ref(null)

const triggerFileInput = () => fileInput.value?.click()

const handleFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file) {
    return
  }

  uploadingImage.value = true
  try {
    await uploadProfileImageApi(file)
    await fetchMyInfo()
    alert('프로필 이미지가 변경되었습니다.')
  } catch (e) {
    alert('이미지 업로드 실패')
  } finally {
    uploadingImage.value = false
    event.target.value = ''
  }
}

const editingNickname = ref(false)
const tempNickname = ref('')

const startEditNickname = () => {
  editingNickname.value = true
  tempNickname.value = nickname.value
}

const cancelEditNickname = () => {
  editingNickname.value = false
  nickname.value = tempNickname.value
}

const editingBio = ref(false)
const tempBio = ref('')

const startEditBio = () => {
  editingBio.value = true
  tempBio.value = bio.value
}

const cancelEditBio = () => {
  editingBio.value = false
  bio.value = tempBio.value
}

</script>

<template>
  <div class="mypage">
    <div class="mypage-shell" v-if="!loading">
      <!-- 왼쪽 메뉴 -->
      <aside class="sidebar">
        <h2 class="sidebar-title">마이페이지</h2>
        <nav class="sidebar-menu">
          <button
            v-for="m in menus"
            :key="m.key"
            class="menu-item"
            :class="{ active: activeMenu === m.key }"
            @click="activeMenu = m.key"
          >
            {{ m.label }}
          </button>
        </nav>
      </aside>

      <!-- 오른쪽 내용 -->
      <section class="content">
        <!-- 내 정보 탭 -->
        <div v-if="activeMenu === 'info'" class="card">
          <h3 class="card-title">내 정보</h3>

          <div class="profile-top">
            <!-- 프로필 이미지 -->
            <div class="profile-image-wrap">
              <div class="profile-image">
                <img
                  v-if="profileImageUrl"
                  :src="profileImageUrl"
                />
                <div v-else class="profile-placeholder">
                  {{ userInfo.nickname?.[0] || 'U' }}
                </div>
              </div>
              <button class="btn-outline" @click="triggerFileInput">
                {{ uploadingImage ? '업로드 중...' : '이미지 변경' }}
              </button>
              <input
                type="file"
                ref="fileInput"
                accept="image/*"
                class="file-input-hidden"
                @change="handleFileChange"
              />
            </div>

            <!-- 기본 정보 -->
            <div class="profile-main">
              <div class="field">
                <label>이메일</label>
                <div class="readonly-box">{{ userInfo.email }}</div>
              </div>

              <div class="field-row">
                <input v-model="nickname" class="input" />

                <template v-if="editingNickname">
                  <div class="btn-group">
                    <button class="btn-red" @click="handleSaveNickname">저장</button>
                    <button class="btn-outline" @click="cancelEditNickname">취소</button>
                  </div>
                </template>

                <template v-else>
                  <button class="btn-outline" @click="startEditNickname">수정</button>
                </template>
              </div>
              <div class="field">
                <label>잔여 포인트</label>
                <div class="readonly-box">{{ userInfo.amount }} P</div>
              </div>
            </div>
          </div>

          <!-- 자기소개 -->
          <div class="field">
            <label>자기소개</label>
            <textarea
              v-model="bio"
              class="textarea"
              maxlength="200"
            ></textarea>
            <div class="field-footer" v-if="editingBio">
              <button class="btn-red" @click="handleSaveBio">저장</button>
              <button class="btn-outline" @click="cancelEditBio">취소</button>
            </div>

            <div class="field-footer" v-else>
              <button class="btn-outline" @click="startEditBio">수정</button>
            </div>
          </div>
        </div>

        <!-- 다른 탭 -->
        <div v-else-if="activeMenu === 'points'" class="card">
          <h3 class="card-title">포인트 이력</h3>
          <p class="empty-text">준비중입니다.</p>
        </div>

        <div v-else-if="activeMenu === 'purchases'" class="card">
          <h3 class="card-title">구매 내역</h3>
          <p class="empty-text">준비중입니다.</p>
        </div>

        <div v-else-if="activeMenu === 'sales'" class="card">
          <h3 class="card-title">판매 내역</h3>
          <p class="empty-text">준비중입니다.</p>
        </div>
      </section>
    </div>

    <div v-else class="loading-text">불러오는 중...</div>
  </div>
</template>
<style scoped>
.mypage {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 10px;
  box-sizing: border-box;
}

/* 전체 틀 */
.mypage-shell {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 32px;
}

/* ================= 사이드바 ================= */
.sidebar {
  background: linear-gradient(135deg, #111, #151515);
  border-radius: 16px;
  padding: 24px 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.8);
}

.sidebar-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: #eee;
  font-size: 14px;
  cursor: pointer;
  transition: 0.15s;
  text-align: left;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.menu-item.active {
  background: #e60023;
  color: #fff;
}

/* ================= 카드 ================= */
.content {
  min-width: 0;
}

.card {
  background: radial-gradient(circle at top left, #171717, #050505);
  border-radius: 18px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.85);
  box-sizing: border-box;
  overflow: hidden; /* 어떤 요소도 침범 불가 */
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 22px;
}

/* ================= 프로필 영역 ================= */
.profile-top {
  display: flex;
  gap: 24px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.profile-image-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.profile-image {
  width: 96px;
  height: 96px;
  border-radius: 999px;
  overflow: hidden;
  background: #111;
  border: 1px solid rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-placeholder {
  font-size: 32px;
  font-weight: 700;
  color: #e60023;
}

/* 오른쪽 텍스트 영역 */
.profile-main {
  flex: 1;
  min-width: 260px;
  box-sizing: border-box;
}

/* ================= 폼 ================= */
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
  width: 100%;
  box-sizing: border-box;
}

.field label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

/* -------- input + 버튼 라인 -------- */
.field-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  flex-wrap: nowrap;
  overflow: hidden; /* 더 이상 침범 불가 */
}

/* input 설정 */
.input {
  flex: 1;        /* 남은 공간 모두 차지 */
  min-width: 0;   /* 버튼 때문에 튀어나가는 문제 해결 */
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 14px;
  box-sizing: border-box;
}

/* textarea */
.textarea {
  width: 100%;
  min-width: 0;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 14px;
  resize: vertical;
  min-height: 90px;
  box-sizing: border-box;
}

/* read only box */
.readonly-box {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  opacity: 0.85;
  font-size: 14px;
}

/* -------- 버튼 그룹 -------- */
.btn-group {
  display: flex;
  gap: 8px;
  flex-shrink: 0; /* 버튼은 고정 */
  white-space: nowrap;
}

.btn-red,
.btn-outline {
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

/* 저장 버튼 */
.btn-red {
  background: #e60023;
  color: #fff;
  border: none;
  font-weight: 600;
}

.btn-red:hover {
  background: #ff0033;
  transform: translateY(-1px);
}

/* 취소 / 수정 버튼 */
.btn-outline {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.08);
}

/* -------- field-footer -------- */
.field-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
}

/* 포인트 위 자연스러운 공백 */
.profile-main .field:nth-child(3) {
  margin-top: 12px;
}

/* 숨김 파일 input */
.file-input-hidden {
  display: none;
}

/* ================= 반응형 ================= */
@media (max-width: 860px) {
  .mypage-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    order: -1;
  }

  .profile-top {
    flex-direction: column;
    align-items: center;
  }

  .profile-main {
    width: 100%;
  }

  .field-row {
    flex-wrap: wrap;
  }

  .btn-group {
    margin-top: 6px;
  }
}

</style>
