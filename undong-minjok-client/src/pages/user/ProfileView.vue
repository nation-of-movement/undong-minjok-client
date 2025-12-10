<!-- src/views/MyPage.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import {
  getMyInfoApi,
  updateNicknameApi,
  updateBioApi,
  uploadProfileImageApi,
  deleteUserApi,
  resetPasswordApi
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
    auth.$patch({
      user: {
        ...auth.user,
        ...data
      }
    })
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

  const newNick = nickname.value.trim()

  if (newNick === userInfo.value.nickname) {
    alert('변경된 내용이 없습니다.')
    return
  }
  if (!newNick) return

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
  const newBio = bio.value.trim()

  if (newBio === (userInfo.value.bio || '')) {
    alert('변경된 내용이 없습니다.')
    return
  }

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

/* ================================
 * 수정 상태 관리
 * ================================ */
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

const showDeleteModal = ref(false)

const confirmDeleteUser = async () => {
  try {
    await deleteUserApi()
    alert("회원 탈퇴가 완료되었습니다.")

    auth.logout()

    window.location.replace("/")
    window.location.reload();

  } catch (e) {
    alert("탈퇴 실패")
  }
}

/* ================================
 * 비밀번호 변경 모달 로직
 * ================================ */
import { usePasswordSearchStore } from "@/stores/passwordSearchStore";
const passwordResetStore = usePasswordSearchStore();

const showPasswordModal = ref(false);
const newPassword = ref("");
const newPasswordCheck = ref("");

const openPasswordModal = () => {
  passwordResetStore.startFlow("PASSWORD_RESET");
  newPassword.value = "";
  newPasswordCheck.value = "";
  showPasswordModal.value = true;
};

const sendResetEmail = async () => {
  if (passwordResetStore.sending) return;

  const ok = await passwordResetStore.sendCode(userInfo.value.email);
  if (ok) {
    alert("인증번호가 이메일로 발송되었습니다.");
    passwordResetStore.codeSent = true; // 인증번호 입력 UI 활성화
  }
};

const verifyResetCode = async () => {
  const ok = await passwordResetStore.verifyCode(
    userInfo.value.email,
    passwordResetStore.code
  );

  if (ok) alert("인증되었습니다!");
};

const submitResetPassword = async () => {

  if (!passwordResetStore.emailVerified) {
    return alert("이메일 인증이 필요합니다.");
  }

  if (!newPassword.value || newPassword.value.length < 6) {
    return alert("비밀번호는 6자리 이상이어야 합니다.");
  }

  if (newPassword.value !== newPasswordCheck.value) {
    return alert("비밀번호가 서로 일치하지 않습니다.");
  }

  try {
    await resetPasswordApi({
      resetToken: passwordResetStore.resetToken,
      newPassword: newPassword.value,
    });

    alert("비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.");
    auth.logout();
    window.location.replace("/")
    window.location.reload();
  } catch (e) {
    alert("비밀번호 변경에 실패했습니다.");
  }
};


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
              <div class="field">
                <label>비밀번호</label>
                <button class="btn-outline" @click="openPasswordModal">비밀번호 변경</button>
              </div>
            </div>
          </div>

          <!-- 자기소개 -->
          <div class="field">
            <label>자기소개</label>
            <textarea v-model="bio" class="textarea" maxlength="200"></textarea>

            <div class="field-footer-between">
              <!-- 왼쪽: 탈퇴 버튼 -->
              <button class="delete-account-btn" @click="showDeleteModal = true">
                회원 탈퇴
              </button>

              <!-- 오른쪽: 수정/저장/취소 -->
              <div v-if="editingBio" class="btn-group">
                <button class="btn-red" @click="handleSaveBio">저장</button>
                <button class="btn-outline" @click="cancelEditBio">취소</button>
              </div>

              <div v-else>
                <button class="btn-outline" @click="startEditBio">수정</button>
              </div>
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

    <!-- ================= 모달 ================= -->
    <div class="modal-backdrop" v-if="showDeleteModal">
      <div class="modal">
        <h3>정말 탈퇴하시겠습니까?</h3>
        <p>탈퇴 후 정보는 복구할 수 없습니다.</p>

        <div class="modal-actions">
          <button class="btn-outline" @click="showDeleteModal = false">취소</button>
          <button class="btn-red" @click="confirmDeleteUser">탈퇴</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= 비밀번호 변경 모달 ================= -->
  <div class="modal-backdrop" v-if="showPasswordModal">
    <div class="modal">

      <h3>비밀번호 변경</h3>

      <!-- 이메일 -->
      <div class="field-row" style="margin-bottom: 12px;">
        <div class="readonly-box" style="flex:1; text-align:left;">
          {{ userInfo.email }}
        </div>
        <button
          class="btn-outline"
          :disabled="passwordResetStore.sending || passwordResetStore.emailVerified"
          @click="sendResetEmail"
        >
          <!-- 버튼 표시 텍스트 -->
          <span v-if="passwordResetStore.sending">요청 중...</span>
          <span v-else-if="passwordResetStore.codeSent && !passwordResetStore.emailVerified">재요청</span>
          <span v-else>인증 요청</span>
        </button>

      </div>

      <!-- 인증번호 입력 + 확인 -->
      <div class="field-row" style="margin-bottom: 8px;">
        <input
          v-model="passwordResetStore.code"
          placeholder="인증번호 입력"
          class="input"
          :disabled="passwordResetStore.emailVerified"
        />
        <button
          class="btn-red"
          :disabled="passwordResetStore.emailVerified"
          @click="verifyResetCode"
        >
          확인
        </button>
      </div>

      <!-- 인증 결과 표시 -->
      <p v-if="passwordResetStore.emailVerified" class="success">✔ 인증 완료</p>
      <p v-if="passwordResetStore.verifyFail" class="error">❌ 인증 실패</p>

      <!-- 타이머 -->
      <p v-if="!passwordResetStore.emailVerified && passwordResetStore.timer > 0" class="timer">
        ⏳ {{ passwordResetStore.timer }}초 남음
      </p>

      <!-- 새 비밀번호 -->
      <input
        type="password"
        class="input"
        placeholder="새 비밀번호"
        v-model="newPassword"
        style="margin-top: 12px;"
      />

      <!-- 새 비밀번호 확인 -->
      <input
        type="password"
        class="input"
        placeholder="새 비밀번호 확인"
        v-model="newPasswordCheck"
        style="margin-top: 8px;"
      />

      <!-- 버튼 -->
      <div class="modal-actions">
        <button class="btn-outline" @click="showPasswordModal = false">취소</button>
        <button class="btn-red" @click="submitResetPassword">변경</button>
      </div>

    </div>
  </div>

</template>
<style scoped>
.field-footer-between {
  margin-top: 10px;
  display: flex;
  justify-content: space-between; /* 🔥 양 끝으로 배치 */
  align-items: center;
}

.delete-account-btn {
  padding: 8px 14px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid rgba(255, 80, 80, 0.7);
  color: #ff4d4d;
  font-size: 13px;
  cursor: pointer;
  transition: 0.15s;
}

.delete-account-btn:hover {
  background: rgba(255, 80, 80, 0.1);
}

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

.delete-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-start; /* 🔥 왼쪽 정렬 */
}

.delete-account-btn {
  padding: 8px 14px; /* 수정/취소 버튼과 동일 */
  border-radius: 10px;
  background: transparent;
  border: 1px solid rgba(255, 80, 80, 0.7);
  color: #ff4d4d;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  width: auto !important;
}


.delete-account-btn:hover {
  background: rgba(255, 80, 80, 0.1);
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal {
  background: #1a1a1a;
  padding: 24px 28px;
  border-radius: 14px;
  width: 320px;
  text-align: center;
  border: 1px solid rgba(255,255,255,0.08);
}

.modal h3 {
  font-size: 18px;
  margin-bottom: 12px;
  font-weight: 600;
}

.modal p {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
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
