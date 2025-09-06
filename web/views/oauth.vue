<template>
  <div class="flex mt-10 justify-center">
    <n-spin size="large">
      <template #description> 登录中 </template>
    </n-spin>
  </div>
</template>
<script setup lang="ts">
  import instance from '@/utils/ky'

  import { useRoute, useRouter } from 'vue-router'
  import { nMessage } from '@/utils/naive'
  import { ROUTE_NAME_INDEX } from '@/router'

  const route = useRoute(),
    router = useRouter()

  import signStore from '@/stores/sign.ts'
  const storeSign = signStore()

  let oauth_code = route.query.code

  if (oauth_code) {
    let oauth_data = {
      type: route.params.type,
      code: oauth_code,
    }

    if (storeSign.is_sign) {
      instance
        .post('/api/oauth/bind', {
          json: oauth_data,
        })
        .then(() => {
          nMessage().success('绑定成功')
        })
        .catch(() => {
          nMessage().error('绑定失败 请重试')
        })
        .finally(() => {
          router.replace({
            name: ROUTE_NAME_INDEX,
          })
        })
    } else {
      instance
        .post('/api/sign/oauth', {
          json: oauth_data,
        })
        .then(async (res) => {
          let data: { token?: string; username?: string } = await res.json(),
            token = data.token,
            username = data.username
          if (token) {
            storeSign.signEntry(username, token)
            nMessage().success(`欢迎回来 ${username}`, {
              showIcon: false,
            })

            await router.replace({
              name: 'Home',
            })
          } else {
            nMessage().error('请先绑定账号后再使用快捷登录', {
              duration: 1000 * 5,
            })
            await router.replace({
              name: ROUTE_NAME_INDEX,
            })
            storeSign.show = true
          }
        })
        .catch(() => {
          nMessage().error('登录失败 请重试')
          router.replace({
            name: ROUTE_NAME_INDEX,
          })
        })
    }
  } else {
    nMessage().error('好像那里出错了 请重试')
    router.replace({
      name: ROUTE_NAME_INDEX,
    })
  }
</script>
<style scoped lang="stylus"></style>
