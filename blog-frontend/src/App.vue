<script setup>
import { useRouter, useRoute } from "vue-router"
import { ref, computed } from "vue"

const router = useRouter()
const route = useRoute()

// 计算属性:是否已登录(有 token)
const isLoggedIn = computed(() => !!localStorage.getItem("token"))

// 退出登录
function logout() {
    localStorage.removeItem("token")
    router.push("/login")
}
</script>

<template>
  <div id="app">
    <!-- 导航栏 -->
    <nav class="navbar">
      <router-link to="/articles" class="nav-link">文章列表</router-link>
      <router-link to="/write" class="nav-link" v-if="isLoggedIn">写文章</router-link>
      <button v-if="isLoggedIn" @click="logout" class="nav-btn">退出</button>
      <router-link to="/login" class="nav-link" v-if="!isLoggedIn">登录</router-link>
    </nav>

    <!-- 路由出口:页面内容 -->
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.navbar {
  display: flex;
  gap: 16px;
  padding: 12px 24px;
  background: #2c3e50;
  align-items: center;
}
.nav-link {
  color: #42b983;
  text-decoration: none;
  font-weight: bold;
}
.nav-link:hover {
  color: #fff;
}
.nav-btn {
  background: transparent;
  border: 1px solid #42b983;
  color: #42b983;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
}
.nav-btn:hover {
  background: #42b983;
  color: #fff;
}
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}
</style>
