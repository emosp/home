<template>
  <div class="p-40 max-sm:p-10">
    <n-card title="连接">
      <template #header-extra>{{ link_uuid }}</template>
      将登录 {{ link_name }} {{ link_host }}
      <template #footer v-if="!storeSign.is_sign">
        <n-button text @click="storeSign.showEntry()">请登录后访问</n-button>
      </template>
      <template #action v-if="storeSign.is_sign">
        <div class="flex mt-5 justify-center" v-if="loading">
          <n-spin size="large">
            <template #description> 验证中 </template>
          </n-spin>
        </div>
        <div v-else>
          <n-button type="primary" tag="a" :href="link_to"> 同意 </n-button>
          <n-button
            style="margin-left: 10px"
            type="error"
            @click="
              router.push({
                name: ROUTE_NAME_INDEX,
              })
            ">
            拒绝
          </n-button>
        </div>
      </template>
    </n-card>
  </div>
</template>
<script setup lang="ts">
  import instance from '@/utils/ky'
  import { ref } from 'vue'
  import { nMessage } from '@/utils/naive'
  import { useRouter, useRoute } from 'vue-router'
  const route = useRoute(),
    router = useRouter()

  import signStore from '@/stores/sign.ts'
  import { ROUTE_NAME_INDEX } from '@/router'
  const storeSign = signStore()

  const link_name = route.query.name,
    link_url = route.query.url,
    link_host = new URL(link_url).host,
    link_to = ref(),
    link_uuid = route.params.uuid

  const loading = ref(true)

  if (storeSign.is_sign) {
    instance
      .get('/api/sign/isSign', {
        searchParams: {
          link_uuid,
        },
      })
      .then(async (res) => {
        let { is_sign } = await res.json()
        if (!is_sign) {
          nMessage().error('请登录后再访问')
          storeSign.tokenRemove()
          storeSign.showEntry()
        }
      })
      .finally(() => {
        link_to.value = `${route.query.url}?username=${storeSign.user_username}&avatar=${storeSign.user_avatar}&token=${storeSign.user_token}`
        loading.value = false
      })
  } else {
    nMessage().error('请登录后再访问')
    storeSign.showEntry()
  }
</script>
<style scoped lang="stylus"></style>
