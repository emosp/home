<template>
  <div style="padding: 20px">
    <n-page-header
      subtitle="自己追的剧 记得看完哦"
      @back="
        router.push({
          name: 'Index',
        })
      ">
      <template #title> 求片列表 </template>
      <template #extra>
        <n-button @click="getData">刷新</n-button>
      </template>
    </n-page-header>

    <div class="mt-5">
      <n-list bordered>
        <n-list-item v-for="data in datas" :key="data.id">
          <template #prefix>
            <div style="width: 80px">
              <img style="width: 100%" :src="data.image" />
            </div>
          </template>
          <n-thing>
            <template #header> {{ data.title }} # {{ data.time }} </template>
            <template #description>
              <div class="line-clamp-2">
                <n-button text tag="a" :href="data.tmdb_url" target="_blank" type="primary"> {{ data.type }} </n-button>
                {{ data.description }}
              </div>
            </template>
            <template #footer>
              <code>{{ data.favorites_count }}</code> 人同求
            </template>
          </n-thing>
        </n-list-item>
      </n-list>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue'
  import instance from '@/utils/ky'

  import { useRouter } from 'vue-router'
  const router = useRouter()

  const datas = ref([]),
    getData = async () => {
      datas.value = await instance.get('/api/favorite').json()
    }

  getData()
</script>
<style scoped lang="stylus"></style>
