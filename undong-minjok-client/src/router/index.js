import { createRouter, createWebHistory } from "vue-router";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import HomeView from "@/pages/HomeView.vue";
import { useAuthStore } from '@/stores/authStore';
import PointPaymentsView from '@/pages/point/PointPaymentsView.vue'
import PointPaymentsSucceeView from "@/pages/point/PointPaymentsSucceeView.vue";
import MonthSelectView
  from '@/pages/DailyWorkoutRecord/calender/MonthSelectView.vue'
import CalendarView from '@/pages/DailyWorkoutRecord/calender/CalendarView.vue'
import RecordView from '@/pages/DailyWorkoutRecord/record/RecordView.vue'
import PointHistoryView from '@/pages/point/PointHistoryView.vue'


const routes = [
  {
    path: "/",
    component: DefaultLayout,
    children: [
      { path: "", component: HomeView },
      { path: "login", component: () => import("@/pages/user/LoginView.vue") },
      { path: "signup", component: () => import("@/pages/user/SignupView.vue") },
      { path: "id/search", component: () => import("@/pages/user/IdSearchView.vue") },
      { path: "password/search", component: () => import("@/pages/user/PasswordSearchView.vue") },
      { path: "password/reset", component: () => import("@/pages/user/ResetPasswordView.vue") },
      { path: "profile", component: () => import("@/pages/user/ProfileView.vue"), meta: { requiresAuth: true } },
      { path: "/point-history", name: "PointHistory", component: PointHistoryView , meta: { requiresAuth: true }},
      { path: '/point-charge', name: 'PointPayments',component: PointPaymentsView , props: true},
      { path: "/success", name: "Success", component: PointPaymentsSucceeView },
    ]
  },
  {
    path: "/month",
    name: "MonthSelect",
    component: MonthSelectView
  },
  {
    path: "/calendar/:year/:month",
    name: "Calendar",
    component: CalendarView,
    props: true
  },
  {
    path: '/record',
    name: 'Record',
    component: RecordView,
    props: route => ({ date: route.query.date })
    // → query 로 넘긴 date를 props 로 받을 수 있게 함
  },
// -------------------- 템플릿 상세 페이지 --------------------
  {
    path: "/templates/:id",
    name: "TemplateDetail",
    component: () => import("@/pages/templates/TemplateDetailView.vue"),
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// -------------------- 인증 라우터 가드 --------------------
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.accessToken) {
    return next("/login");
  }

  next();
});

export default router;
