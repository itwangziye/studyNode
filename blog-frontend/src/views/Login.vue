<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { login } from "../api"

const router = useRouter()

// 表单数据
const email = ref("user@test.com")
const password = ref("123456")
const loading = ref(false)

// 登录
async function handleLogin() {
    loading.value = true
    try {
        const data = await login({ email: email.value, password: password.value })
        // 存 token
        localStorage.setItem("token", data.token)
        // 跳转文章列表
        router.push("/articles")
    } catch (e) {
        // 错误已在拦截器统一 alert
    } finally {
        loading.value = false
    }
}
</script>

<template>
  <div class="login">
    <h2>登录</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-item">
        <label>邮箱</label>
        <input v-model="email" type="email" placeholder="输入邮箱" />
      </div>
      <div class="form-item">
        <label>密码</label>
        <input v-model="password" type="password" placeholder="输入密码" />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? "登录中..." : "登录" }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.login {
  max-width: 400px;
  margin: 40px auto;
}
.form-item {
  margin-bottom: 16px;
}
.form-item label {
  display: block;
  margin-bottom: 4px;
  font-weight: bold;
}
.form-item input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
button {
  width: 100%;
  padding: 10px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
button:hover {
  background: #3aa876;
}
button:disabled {
  background: #ccc;
}
</style>
