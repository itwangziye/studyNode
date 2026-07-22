// ============================================================
// Axios 封装 —— 统一请求/响应拦截、token 管理
// ============================================================
import axios from "axios"

// 创建 axios 实例,统一配置 baseURL 和超时
const request = axios.create({
    baseURL: "http://localhost:3000",   // 后端地址
    timeout: 10000,
})

// 请求拦截器:每次请求自动带上 token
request.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// 响应拦截器:统一拆包 { code, message, data }
request.interceptors.response.use(
    (response) => {
        const res = response.data
        // 后端统一返回 { code, message, data }
        if (res.code === 200) {
            return res.data        // 直接返回 data,组件里不用再 .data
        }
        // 非 200 统一报错
        alert(res.message)
        return Promise.reject(new Error(res.message))
    },
    (error) => {
        // HTTP 错误(401/403/404/429 等)
        const msg = error.response?.data?.message || "网络错误"
        alert(msg)

        // 401 未登录 → 跳转登录页
        if (error.response?.status === 401) {
            localStorage.removeItem("token")
            window.location.href = "/login"
        }
        return Promise.reject(error)
    }
)

export default request
