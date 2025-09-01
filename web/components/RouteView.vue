<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="KEEP_ALIVE_NAME">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<script setup lang="ts">
  /**
   * https://github.com/vuejs/router/issues/626
   * 如果再父级不用这个组件 直接 router-view 也是可行的
   */
  import { KEEP_ALIVE_NAME } from '@/router'
</script>
