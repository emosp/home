<template>
  <div class="home p-40 max-sm:p-10">
    <n-card title="欢迎">
      <template #header-extra>
        <n-button
          text
          @click="
            () => {
              router.push({
                name: 'Index',
              })
            }
          ">
          回主页
        </n-button>
      </template>
      <n-list>
        <template #header>
          <code class="text-4xl overflow-hidden text-ellipsis">
            {{ storeSign.user_username }}
          </code>
        </template>
        <template #footer>
          <p>求片或意见反馈等请提 <a href="http://github.com/emosp/home/issues">issues</a></p>
        </template>
        <n-list-item>
          <n-thing>
            <template #header>
              <div
                :style="{
                  display: loading ? 'unset' : 'flex',
                }">
                <p>登录域名:</p>
                <div class="ml-2">
                  <n-skeleton v-if="loading" text :repeat="1" />
                  <p v-else>
                    <code>{{ data.emby_url }}</code>
                  </p>
                </div>
              </div>
            </template>
            <template #description>
              <p>使用注册时用户名密码登录</p>
              <p>不删档内测中 不限客户端 无须保号</p>
            </template>
          </n-thing>
        </n-list-item>
      </n-list>
    </n-card>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import instance from '@/utils/ky'
  import signStore from '@/stores/sign.ts'

  const storeSign = signStore(),
    router = useRouter()

  const loading = ref(true),
    data = ref({}),
    getData = async () => {
      loading.value = true
      data.value = await instance.get('/api/home').json()
      loading.value = false
    }

  getData()
</script>
<style scoped lang="stylus"></style>
