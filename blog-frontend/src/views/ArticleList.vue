<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { getArticles } from "../api"

const router = useRouter()
const articles = ref([])
const page = ref(1)

async function loadArticles() {
    articles.value = await getArticles(page.value)
}

onMounted(() => loadArticles())
</script>

<template>
  <div>
    <h2>文章列表</h2>
    <div v-for="a in articles" :key="a.id" @click="router.push(`/articles/${a.id}`)">
      <!-- 你的模板 -->
       {{a.title}}
    </div>
    <!-- 分页按钮 -->
    <button @click="page--; loadArticles()" :disabled="page <= 1">上一页</button>
    第 {{ page }} 页
    <button @click="page++; loadArticles()">下一页</button>
  </div>
</template>