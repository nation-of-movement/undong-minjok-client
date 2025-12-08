import { createRouter, createWebHistory } from "vue-router";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import HomeView from "@/pages/HomeView.vue";
import CalendarView from '@/pages/DailyWorkoutRecord/calender/CalendarView.vue'
import MonthSelectView from '@/pages/DailyWorkoutRecord/calender/MonthSelectView.vue'
import RecordView from '@/pages/DailyWorkoutRecord/record/RecordView.vue'


const routes = [
  {
    path: "/",
    component: DefaultLayout,
    children: [
      { path: "", component: HomeView },
      { path: "login", component: () => import("@/pages/user/LoginView.vue") },
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

];

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
