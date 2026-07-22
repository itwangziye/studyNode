// ============================================================
// 路由守卫 —— 检查登录状态
// ============================================================
export function routeGuard(to, from, next) {
    const token = localStorage.getItem("token")

    // 需要登录但没 token → 跳登录页
    if (to.meta.requiresAuth && !token) {
        next("/login")
        return
    }

    next()
}
