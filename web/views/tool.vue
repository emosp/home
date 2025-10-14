<template>
  <div style="padding: 20px">
    <n-page-header
      subtitle="如果不知道干嘛的 请不要点击"
      @back="
        router.push({
          name: 'Index',
        })
      ">
      <template #title> 工具列表 </template>
    </n-page-header>
    <n-list>
      <n-list-item>
        <n-thing title="OneDrive" description="获取 refresh_token" />
        <template #suffix>
          <n-button tag="a" target="_blank" href="/api/tool/getOneDriveToken">点击获取</n-button>
        </template>
      </n-list-item>
    </n-list>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue'
  import instance from '@/utils/ky'

  import { useRouter } from 'vue-router'
  const router = useRouter()
</script>
<style scoped lang="stylus"></style>
