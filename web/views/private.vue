<template>
  <div style="padding: 20px">
    <n-page-header
      @back="
        router.push({
          name: 'Index',
        })
      ">
      <template #title> 隐私策略 </template>
      <template #subtitle>更新时间: 2025-11-05</template>
      <div>
        <!-- todo: 要写 -->
        欢迎您使用emos！我们深知个人信息对您的重要性，并致力于保护您的隐私和安全。本隐私政策旨在说明在您使用emos媒体服务器及相关服务（以下简称"本服务"）时，我们如何收集、使用、存储、保护和共享您的信息，并说明您所享有的权利。请您在使用本服务前，仔细阅读并理解本政策。
      </div>
    </n-page-header>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue'
  import instance from '@/utils/ky'

  import { useRouter } from 'vue-router'
  const router = useRouter()
</script>
<style scoped lang="stylus"></style>
