// ============================================================
// API 接口定义 —— 按模块组织,组件直接调用
// ============================================================
import request from "./request"

// ========== 认证 ==========
export const login = (data) => request.post("/auth/login", data)
export const register = (data) => request.post("/auth/register", data)

// ========== 文章 ==========
export const getArticles = (page = 1, pageSize = 10) =>
    request.get("/articles", { params: { page, pageSize } })

export const getArticle = (id) => request.get(`/articles/${id}`)

export const createArticle = (data) => request.post("/articles", data)

export const getRanking = (topN = 10) =>
    request.get("/articles/ranking", { params: { topN } })

// ========== 评论 ==========
export const getComments = (articleId) =>
    request.get(`/articles/${articleId}/comments`)

export const createComment = (articleId, data) =>
    request.post(`/articles/${articleId}/comments`, data)
