<script setup>
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { getArticle, getComments, createComment } from "../api"

const route = useRoute()
const router = useRouter()
const article = ref({})
const comments = ref([])
const newComment = ref("")

async function loadData() {
    const id = route.params.id
    article.value = await getArticle(id)
    comments.value = await getComments(id)
}

async function handleComment() {
    if (!newComment.value.trim()) return
    await createComment(route.params.id, { content: newComment.value })
    newComment.value = ""        // 清空输入框
    comments.value = await getComments(route.params.id)   // 刷新评论
}

onMounted(() => loadData())
</script>

<template>
  <div>
    <!-- 文章 -->
    <h2>{{ article.title }}</h2>
    <p>作者:{{ article.author?.name }}</p>
    <div>{{ article.content }}</div>

    <!-- 评论区 -->
    <h3>评论</h3>
    <div v-for="c in comments" :key="c.id">
      <strong>{{ c.user?.name }}</strong>: {{ c.content }}
    </div>

    <!-- 发评论 -->
    <div>
      <textarea v-model="newComment" placeholder="写评论..."></textarea>
      <button @click="handleComment">发表</button>
    </div>
  </div>
</template>