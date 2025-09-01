<template>
  <n-config-provider :theme="storeTheme.getTheme" :locale="zhCN" :date-locale="dateZhCN">
    <n-global-style />
    <Sign />
    <RouteView />
  </n-config-provider>
</template>

<script setup lang="ts">
  import { zhCN, dateZhCN } from 'naive-ui'
  import themeStore from '@/stores/theme.ts'
  const storeTheme = themeStore()
</script>

<style scoped lang="stylus"></style>
