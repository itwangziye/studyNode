// ============================================================
// Vue Router —— 路由配置
// ============================================================
import { createRouter, createWebHistory } from "vue-router"
import { routeGuard } from "./guard"

const routes = [
    {
        path: "/",
        redirect: "/articles",
    },
    {
        path: "/login",
        name: "Login",
        component: () => import("../views/Login.vue"),
    },
    {
        path: "/articles",
        name: "ArticleList",
        component: () => import("../views/ArticleList.vue"),
    },
    {
        path: "/articles/:id",
        name: "ArticleDetail",
        component: () => import("../views/ArticleDetail.vue"),
    },
    {
        path: "/write",
        name: "Write",
        component: () => import("../views/Write.vue"),
        meta: { requiresAuth: true },    // 需要登录
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// 全局路由守卫
router.beforeEach(routeGuard)

export default router
