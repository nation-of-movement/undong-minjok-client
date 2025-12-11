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

import { templateApi } from '@/api/axios.js'
import equipmentApi from '@/api/equipmentApi.js'
import partsApi from '@/api/partApi.js'

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
    profileImageUrl.value = data.profileImagePath
      ? IMAGE_BASE_URL + data.profileImagePath
      : "/default.png";

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

/* ================================
 *  구매내역 및 판매내역
 * ================================ */
const purchaseList = ref([])
const salesList = ref([])

const loadingPurchases = ref(false)
const loadingSales = ref(false)

// 구매 내역 가져오기
const fetchPurchases = async () => {
  if (loadingPurchases.value) return
  loadingPurchases.value = true
  try {
    const res = await templateApi.getMyPurchaseHistory()
    // 백엔드: ApiResponse<List<TemplatePurchaseHistoryDTO>>
    purchaseList.value = res.data.data || []
  } catch (e) {
    console.error('구매 내역 조회 실패', e)
  } finally {
    loadingPurchases.value = false
  }
}

// 판매 내역 가져오기
const fetchSales = async () => {
  if (loadingSales.value) return
  loadingSales.value = true
  try {
    const res = await templateApi.getMySalesHistory()
    // 백엔드: ApiResponse<List<TemplateSalesHistoryDTO>>
    salesList.value = res.data.data || []
  } catch (e) {
    console.error('판매 내역 조회 실패', e)
  } finally {
    loadingSales.value = false
  }
}

/* ================================
 *  템플릿 수정 / 삭제 (판매 내역 전용)
 * ================================ */

// 수정 모달 on/off + 어떤 템플릿인지
const showEditTemplateModal = ref(false)
const editingTemplateId = ref(null)

// 부위 / 장비 데이터
const parts = ref([])                     // /parts 에서 받아오는 목록
const equipmentsMap = ref({})             // { [partCode]: [{id, name, ...}], ... }

// 부위 목록 로드
const loadParts = async () => {
  try {
    const res = await partsApi.getParts()
    parts.value = res.data.data || []
  } catch (e) {
    console.error('부위 목록 로드 실패', e)
  }
}

// 특정 부위의 장비 목록 로드 (캐시)
const loadEquipmentsForPart = async (partCode) => {
  if (!partCode) return
  if (equipmentsMap.value[partCode]) return  // 이미 있으면 재요청 X

  try {
    const res = await equipmentApi.getEquipmentsByPart(partCode)
    equipmentsMap.value = {
      ...equipmentsMap.value,
      [partCode]: res.data.data || [],
    }
  } catch (e) {
    console.error('장비 목록 로드 실패', e)
  }
}

const openEditTemplateModal = async (templateId) => {
  editingTemplateId.value = templateId

  // 부위 먼저 로드
  await loadParts()
  // 템플릿 상세 로드해서 상태 채우기
  await prepareEditModalData(templateId)

  // 불러온 운동들 안에 들어있는 부위들에 대한 장비도 미리 로드
  const partSet = new Set()
  Object.values(editDayExercises.value).forEach((list) => {
    list.forEach((ex) => {
      if (ex.part) partSet.add(ex.part)
    })
  })
  for (const p of partSet) {
    await loadEquipmentsForPart(p)
  }

  showEditTemplateModal.value = true
}

// ================= 템플릿 수정 모달 상태 =================
const editName = ref('')
const editContent = ref('')
const editPrice = ref(0)

const editThumbnailFile = ref(null)
const editDetailImageFile = ref(null)
const editPreviewThumbnail = ref(null)
const editPreviewDetail = ref(null)

const editCurrentDay = ref(1)

// 7일 운동 배열
const createEmptyDayMap = () => ({
  1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [],
})

const editDayExercises = ref(createEmptyDayMap())

// 템플릿 상세 불러와서 모달에 채우기
const prepareEditModalData = async (templateId) => {
  // 기본값 초기화
  editName.value = ''
  editContent.value = ''
  editPrice.value = 0
  editThumbnailFile.value = null
  editDetailImageFile.value = null
  editPreviewThumbnail.value = null
  editPreviewDetail.value = null
  editCurrentDay.value = 1
  editDayExercises.value = createEmptyDayMap()

  try {
    const res = await templateApi.getDetail(templateId)
    const t = res.data.data

    editName.value = t.name
    editContent.value = t.content
    editPrice.value = t.price

    if (t.thumbnailImage) {
      editPreviewThumbnail.value = IMAGE_BASE_URL + t.thumbnailImage
    }
    if (t.templateImage) {
      editPreviewDetail.value = IMAGE_BASE_URL + t.templateImage
    }

    if (t.days && Array.isArray(t.days)) {
      const dayMap = createEmptyDayMap()

      t.days.forEach((dayDto) => {
        const d = dayDto.day
        if (!dayMap[d]) dayMap[d] = []
        ;(dayDto.exercises || []).forEach((ex, idx) => {
          dayMap[d].push({
            day: d,
            name: ex.name || '',
            part: ex.part || null,              // 부위 코드/이름
            reps: ex.reps ?? null,
            weight: ex.weight ?? null,
            duration: ex.duration ?? null,
            orderIndex: ex.orderIndex ?? idx + 1,
            equipmentId: ex.equipmentId ?? null,
          })
        })
      })

      editDayExercises.value = dayMap
    }
  } catch (e) {
    console.error('템플릿 상세 조회 실패', e)
  }
}

const closeEditTemplateModal = () => {
  showEditTemplateModal.value = false
}

// 운동 추가/삭제
const addEditExercise = () => {
  const d = editCurrentDay.value
  if (!editDayExercises.value[d]) editDayExercises.value[d] = []
  editDayExercises.value[d].push({
    day: d,
    name: '',
    part: null,
    reps: null,
    weight: null,
    duration: null,
    orderIndex: editDayExercises.value[d].length + 1,
    equipmentId: null,
  })
}

const removeEditExercise = (index) => {
  const d = editCurrentDay.value
  if (!editDayExercises.value[d]) return
  editDayExercises.value[d].splice(index, 1)
}

// 부위 선택 변경시 장비 로드
const handleEditExercisePartChange = async (ex) => {
  if (!ex.part) {
    ex.equipmentId = null
    return
  }
  await loadEquipmentsForPart(ex.part)
  ex.equipmentId = null  // 다른 부위 선택하면 장비 초기화
}

// 파일 변경
const onEditThumbnailChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  editThumbnailFile.value = file
  editPreviewThumbnail.value = URL.createObjectURL(file)
}

const onEditDetailImageChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  editDetailImageFile.value = file
  editPreviewDetail.value = URL.createObjectURL(file)
}

// 실제 수정 요청
const submitEditTemplate = async () => {
  if (!editingTemplateId.value) return

  const exercises = []
  for (let d = 1; d <= 7; d++) {
    const list = editDayExercises.value[d] || []
    list.forEach((ex, idx) => {
      exercises.push({
        ...ex,
        day: d,
        orderIndex: idx + 1,
      })
    })
  }

  const dto = {
    name: editName.value,
    content: editContent.value,
    price: editPrice.value,
    status: editPrice.value > 0 ? 'PAID' : 'FREE',
    exercises,
  }

  const form = new FormData()
  form.append('data', JSON.stringify(dto))
  if (editThumbnailFile.value) form.append('thumbnail', editThumbnailFile.value)
  if (editDetailImageFile.value) form.append('detailImage', editDetailImageFile.value)

  try {
    await templateApi.updateTemplate(editingTemplateId.value, form)
    alert('템플릿이 수정되었습니다.')
    showEditTemplateModal.value = false
    fetchSales()
  } catch (e) {
    console.error('템플릿 수정 실패', e)
    alert('템플릿 수정 중 오류가 발생했습니다.')
  }
}

// 삭제 (간단 confirm)
const openDeleteTemplateModal = async (templateId) => {
  if (!confirm('정말 삭제하시겠습니까?')) return

  try {
    await templateApi.deleteTemplate(templateId)
    alert('템플릿이 삭제되었습니다.')
    fetchSales()
  } catch (e) {
    console.error('템플릿 삭제 실패', e)
    alert('삭제 중 오류가 발생했습니다.')
  }
}


// 페이지 들어오면 둘 다 한 번씩 조회
onMounted(() => {
  fetchPurchases()
  fetchSales()
})
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
                <img v-if="profileImageUrl" :src="profileImageUrl" />
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
              <button class="delete-account-btn" @click="showDeleteModal = true">회원 탈퇴</button>

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

        <!-- ================= 구매 내역 ================= -->
        <div v-else-if="activeMenu === 'purchases'" class="card">
          <div class="history-header">
            <h3 class="card-title">구매 내역</h3>
            <span class="history-count">총 {{ purchaseList.length }}개</span>
          </div>

          <div v-if="loadingPurchases" class="empty-text">불러오는 중...</div>
          <div v-else-if="!purchaseList.length" class="empty-text">구매 내역이 없습니다.</div>
          <div v-else class="history-table history-table--purchase">
            <!-- 헤더 행 -->
            <div class="history-row history-row--head">
              <div class="col col-name">NAME</div>
              <div class="col col-desc">DESCRIPTION</div>
              <div class="col col-price">PRICE</div>
              <div class="col col-date">DATE</div>
            </div>

            <!-- 데이터 행 -->
            <div v-for="item in purchaseList" :key="item.templateId" class="history-row">
              <div class="col col-name">{{ item.templateName }}</div>
              <div class="col col-desc">구매한 운동 템플릿입니다.</div>
              <div class="col col-price">{{ item.price }} P</div>
              <div class="col col-date">{{ new Date(item.purchasedAt).toLocaleDateString('ko-KR') }}</div>
            </div>
          </div>
        </div>

        <!-- ================= 판매 내역 ================= -->
        <div v-else-if="activeMenu === 'sales'" class="card">
          <div class="history-header">
            <h3 class="card-title">판매 내역</h3>
            <span class="history-count">총 {{ salesList.length }}개</span>
          </div>

          <div v-if="loadingSales" class="empty-text">불러오는 중...</div>

          <div v-else-if="!salesList.length" class="empty-text">판매 내역이 없습니다.</div>

          <div v-else class="history-table history-table--sales">
            <!-- 헤더 행 (6컬럼: NAME / DESC / SALES / PRICE / DATE / 버튼) -->
            <div class="history-row history-row--head">
              <div class="col col-name">NAME</div>
              <div class="col col-desc">DESCRIPTION</div>
              <div class="col col-sales">SALES</div>
              <div class="col col-price">PRICE</div>
              <div class="col col-date">DATE</div>
              <div class="col col-actions"></div>
            </div>

            <!-- 데이터 행 -->
            <div v-for="item in salesList" :key="item.templateId" class="history-row">
              <div class="col col-name">{{ item.templateName }}</div>
              <div class="col col-desc">내가 판매한 운동 템플릿입니다.</div>
              <div class="col col-sales">{{ item.salesCount }} 개</div>
              <div class="col col-price">{{ item.price }} P</div>
              <div class="col col-date">{{ new Date(item.createdAt).toLocaleDateString('ko-KR') }}</div>

              <!-- 🔥 수정 / 삭제 버튼 -->
              <div class="col col-actions">
                <button class="list-btn list-btn--edit" @click="openEditTemplateModal(item.templateId)">수정</button>
                <button class="list-btn list-btn--delete" @click="openDeleteTemplateModal(item.templateId)">삭제</button>
              </div>
            </div>
          </div>
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

  <!-- ================= 템플릿 수정 모달 (등록 모달 스타일) ================= -->
  <div
    class="modal-overlay edit-template-modal"
    v-if="showEditTemplateModal"
    @click.self="closeEditTemplateModal"
  >
    <div class="modal-container">
      <h2 class="modal-title">템플릿 수정하기</h2>

      <div class="modal-body-grid">
        <!-- LEFT AREA: 기본정보 + Day + 운동 목록 -->
        <div class="left-panel">
          <div class="section">
            <label>템플릿 제목</label>
            <input
              v-model="editName"
              class="input"
              type="text"
              placeholder="예: 7일 분할 루틴"
            />

            <label>설명</label>
            <textarea
              v-model="editContent"
              class="textarea"
              placeholder="템플릿 설명을 입력하세요"
            ></textarea>

            <label>가격</label>
            <input
              v-model.number="editPrice"
              class="input"
              type="number"
              min="0"
              placeholder="가격을 입력하세요 (숫자만)"
            />
          </div>

          <!-- Day 탭 -->
          <div class="day-tabs">
            <button
              v-for="d in 7"
              :key="d"
              :class="['day-tab', { active: editCurrentDay === d }]"
              @click="editCurrentDay = d"
            >
              Day {{ d }}
            </button>
          </div>

          <!-- 운동 입력 UI -->
          <div class="exercise-section">
            <h3>Day {{ editCurrentDay }} 운동 목록</h3>

            <div
              v-for="(ex, idx) in editDayExercises[editCurrentDay]"
              :key="idx"
              class="exercise-item"
            >
              <input v-model="ex.name" class="input-sm" placeholder="운동명" />
              <input
                v-model.number="ex.reps"
                class="input-sm"
                type="number"
                placeholder="횟수"
              />
              <input
                v-model.number="ex.weight"
                class="input-sm"
                type="number"
                placeholder="무게(kg)"
              />
              <input
                v-model.number="ex.duration"
                class="input-sm"
                type="number"
                placeholder="시간(sec)"
              />

              <!-- 부위 선택 -->
              <select
                v-model="ex.part"
                class="input-sm"
                @change="handleEditExercisePartChange(ex)"
              >
                <option :value="null">부위 선택</option>
                <option
                  v-for="part in parts"
                  :key="part.id"
                  :value="part.code"
                >
                  {{ part.name }}
                </option>
              </select>

              <!-- 장비 선택 -->
              <select v-model="ex.equipmentId" class="input-sm">
                <option :value="null">장비 없음</option>
                <option
                  v-for="eq in (equipmentsMap[ex.part] || [])"
                  :key="eq.id"
                  :value="eq.id"
                >
                  {{ eq.name }}
                </option>
              </select>

              <button class="delete-btn" @click="removeEditExercise(idx)">
                삭제
              </button>
            </div>

            <button class="add-btn" @click="addEditExercise">
              + 운동 추가
            </button>
          </div>
        </div>

        <!-- RIGHT AREA: 이미지 -->
        <div class="right-panel">
          <h3 class="right-title">이미지 수정</h3>

          <div class="image-box">
            <label>썸네일 이미지</label>
            <input type="file" @change="onEditThumbnailChange" />

            <div class="image-preview-frame">
              <img
                v-if="editPreviewThumbnail"
                :src="editPreviewThumbnail"
                class="image-preview"
              />
              <div v-else class="image-preview empty">
                현재 이미지를 유지합니다.
              </div>
            </div>
          </div>

          <div class="image-box">
            <label>상세 이미지</label>
            <input type="file" @change="onEditDetailImageChange" />

            <div class="image-preview-frame">
              <img
                v-if="editPreviewDetail"
                :src="editPreviewDetail"
                class="image-preview"
              />
              <div v-else class="image-preview empty">
                현재 이미지를 유지합니다.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 버튼 -->
      <div class="bottom-buttons">
        <button class="submit-btn" @click="submitEditTemplate">수정하기</button>
        <button class="cancel-btn" @click="closeEditTemplateModal">닫기</button>
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
  flex: 1; /* 남은 공간 모두 차지 */
  min-width: 0; /* 버튼 때문에 튀어나가는 문제 해결 */
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

/* ================= 리스트 공통 UI (구매/판매 표) ================= */

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.history-count {
  font-size: 12px;
  opacity: 0.7;
}

/* 테이블 영역 공통 */
.history-table {
  width: 100%;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.5);
}

/* 구매 내역 (4컬럼) */
.history-table--purchase .history-row,
.history-table--purchase .history-row--head {
  display: grid;
  grid-template-columns: 2fr 3fr 1.8fr 1.4fr;
}

/* 판매 내역 (6컬럼: NAME / DESC / SALES / PRICE / DATE / ACTIONS) */
.history-table--sales .history-row,
.history-table--sales .history-row--head {
  display: grid;
  grid-template-columns: 2fr 3fr 1.1fr 2fr 1.4fr 1.6fr;
}



.history-row {
  padding: 10px 14px;
  font-size: 13px;
  align-items: center;
}

.history-row--head {
  background: #FF0033FF;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
}

.history-row--head .col {
  color: #fff;
}

.history-row:nth-child(odd):not(.history-row--head) {
  background: rgba(0, 0, 0, 0.45);
}

.history-row:nth-child(even):not(.history-row--head) {
  background: rgba(0, 0, 0, 0.25);
}

.col {
  padding: 0 6px;
}


/* 오른쪽 액션 버튼 영역 */
.col-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}

/* 리스트용 공통 버튼 (작게) */
.list-btn {
  padding: 6px 14px;
  border-radius: 999px;       /* 동그랗게 */
  font-size: 12px;
  cursor: pointer;
  border-width: 1px;
  border-style: solid;
  background: transparent;
  white-space: nowrap;
}

/* 수정 버튼 - 검은 배경 + 흰색 테두리 (두번째 스샷 스타일) */
.list-btn--edit {
  border-color: rgba(255, 255, 255, 0.6);
  color: #ffffff;
  background: #111111;
}

.list-btn--edit:hover {
  background: #222222;
}

/* 삭제 버튼 - 빨간 테두리 + 빨간 글씨 (회원탈퇴 버튼 스타일) */
.list-btn--delete {
  border-color: #ff4d4d;
  color: #ff4d4d;
  background: #000000;
}

.list-btn--delete:hover {
  background: rgba(255, 77, 77, 0.08);
}


/* PRICE, SALES, DATE는 한 줄 + 정렬 고정 */
.col-price,
.col-sales,
.col-date {
  white-space: nowrap;
}

.col-sales {
  text-align: center;
}

.col-price {
  text-align: right;
}

.col-date {
  text-align: center;
}

/* “준비중입니다 / 내역 없음” 문구용 */
.empty-text {
  margin-top: 16px;
  font-size: 14px;
  opacity: 0.7;
  text-align: center;
}

/* ================= 템플릿 수정 모달 (등록 모달 스타일 복붙) ================= */

.modal-overlay.edit-template-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-overlay.edit-template-modal .modal-container {
  width: 1050px;
  max-height: 92vh;
  overflow-y: hidden;
  background: #111;
  padding: 30px;
  border-radius: 14px;
  color: white;
  border: 1px solid rgba(255,255,255,0.15);
}

.modal-overlay.edit-template-modal .modal-title {
  font-size: 24px;
  margin-bottom: 10px;
}

.modal-overlay.edit-template-modal .modal-body-grid {
  display: flex;
  gap: 30px;
  height: 70vh;
}

/* 숫자 인풋 화살표 제거 */
.modal-overlay.edit-template-modal input[type="number"]::-webkit-outer-spin-button,
.modal-overlay.edit-template-modal input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.modal-overlay.edit-template-modal input[type="number"] {
  -moz-appearance: textfield;
}

/* LEFT */
.modal-overlay.edit-template-modal .left-panel {
  flex: 2;
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 5px;
}

/* RIGHT */
.modal-overlay.edit-template-modal .right-panel {
  flex: 1;
  background: #181818;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.12);
  height: 70%;
  position: sticky;
  top: 0;
}

.modal-overlay.edit-template-modal .image-box {
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
}

.modal-overlay.edit-template-modal .right-title {
  margin-bottom: 15px;
}

/* 이미지 미리보기 */
.modal-overlay.edit-template-modal .image-preview-frame {
  width: 100%;
  height: 130px;
  background: #121212;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.15);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  overflow: hidden;
}

.modal-overlay.edit-template-modal .image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-overlay.edit-template-modal .image-preview.empty {
  color: rgba(255,255,255,0.4);
  font-size: 13px;
}

/* 입력 요소 */
.modal-overlay.edit-template-modal .input,
.modal-overlay.edit-template-modal .textarea,
.modal-overlay.edit-template-modal select,
.modal-overlay.edit-template-modal .input-sm {
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  background: #222;
  color: white;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  font-size: 13px;
}

.modal-overlay.edit-template-modal .input-sm {
  width: 140px;
}

.modal-overlay.edit-template-modal .textarea {
  min-height: 80px;
}

/* Day 탭 */
.modal-overlay.edit-template-modal .day-tabs {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.modal-overlay.edit-template-modal .day-tab {
  padding: 10px 15px;
  background: #222;
  border-radius: 8px;
  cursor: pointer;
  border: none;
}

.modal-overlay.edit-template-modal .day-tab.active {
  background: #e60023;
}

/* 운동 리스트 */
.modal-overlay.edit-template-modal .exercise-section {
  margin-top: 10px;
}

.modal-overlay.edit-template-modal .exercise-item {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.modal-overlay.edit-template-modal .add-btn {
  margin-top: 10px;
  padding: 10px;
  background: #333;
  border-radius: 6px;
  border: none;
  color: #fff;
}

.modal-overlay.edit-template-modal .delete-btn {
  background: #b80000;
  padding: 6px 10px;
  border-radius: 6px;
  border: none;
  color: #fff;
}

/* 하단 버튼 */
.modal-overlay.edit-template-modal .bottom-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.modal-overlay.edit-template-modal .submit-btn {
  padding: 10px 20px;
  background: #e60023;
  border-radius: 8px;
  border: none;
  color: #fff;
}

.modal-overlay.edit-template-modal .cancel-btn {
  padding: 10px 20px;
  background: #333;
  border-radius: 8px;
  border: none;
  color: #fff;
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

  .empty-text {
    font-size: 14px;
    opacity: 0.7;
  }
}
</style>
