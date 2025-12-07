import { createRouter, createWebHistory } from "vue-router";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import HomeView from "@/pages/HomeView.vue";


const routes = [
  {
    path: "/",
    component: DefaultLayout,
    children: [
      { path: "", component: HomeView },
      { path: "login", component: () => import("@/pages/user/LoginView.vue") },
    ]
  },
];

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
