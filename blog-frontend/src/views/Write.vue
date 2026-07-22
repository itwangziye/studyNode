<script setup>
import { ref, onMounted } from "vue"
import { useRouter} from "vue-router"
import { createArticle } from "../api"

const router = useRouter()

const articleForm = ref({
    title: '',
    content: ''
})

const handleSubmit = async() => {
    await createArticle({
        ...articleForm.value
    })
    router.push("/articles")
}

</script>

<template>
  <div>
    <h2>写文章</h2>
    <div><input v-model="articleForm.title" type="text" placeholder="标题"></div>
    <div><textarea v-model="articleForm.content" placeholder="正文"></textarea></div>

    <button type="button" @click="handleSubmit">提交</button>
  </div>
</template>