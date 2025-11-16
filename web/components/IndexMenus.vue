<template>
  <n-menu :mode="props.mode" :options="options" responsive v-model:value="menu" />
</template>
<script setup lang="tsx">
  import { computed } from 'vue'

  const props = defineProps({
    mode: String,
  })

  import { useRouter } from 'vue-router'
  const router = useRouter()

  import signStore from '@/stores/sign.ts'
  const storeSign = signStore()

  import { Github, WikipediaW, TelegramPlane, User, Home, Upload, SignOutAlt, Dove, Tools, Video } from '@vicons/fa'
  import type { MenuOption } from 'naive-ui'
  const menu = ref(),
    options: MenuOption[] = ref([
      {
        label: () => (
          <n-button text tag="a" href="https://wiki.emos.lol/">
            {{
              default: () => 'Wiki',
              icon: () => (
                <n-icon>
                  <WikipediaW />
                </n-icon>
              ),
            }}
          </n-button>
        ),
        key: 'wiki',
      },
      {
        label: () => (
          <n-button text tag="a" target="_blank" href="http://github.com/emosp/home">
            {{
              default: () => 'GitHub',
              icon: () => (
                <n-icon>
                  <Github />
                </n-icon>
              ),
            }}
          </n-button>
        ),
        key: 'github',
      },
      {
        label: () => (
          <n-button text tag="a" target="_blank" href="https://t.me/emospg">
            {{
              default: () => 'Telegram',
              icon: () => (
                <n-icon>
                  <TelegramPlane />
                </n-icon>
              ),
            }}
          </n-button>
        ),
        key: 'telegram',
        show: computed(() => storeSign.is_sign),
      },
      {
        label: () => (
          <n-button
            text
            onClick={() => {
              storeSign.showEntry()
            }}>
            {{
              default: () => '登录/注册',
              icon: () => (
                <n-icon>
                  <User />
                </n-icon>
              ),
            }}
          </n-button>
        ),
        key: 'sign_entry',
        show: computed(() => !storeSign.is_sign),
      },
      {
        label: () => (
          <n-button text tag="a" target="_blank" href="https://uploader.emos.lol">
            {{
              default: () => '上传资源',
              icon: () => (
                <n-icon>
                  <Upload />
                </n-icon>
              ),
            }}
          </n-button>
        ),
        key: 'upload',
        show: computed(() => storeSign.is_sign),
      },
      {
        label: () => (
          <n-button
            text
            onClick={() => {
              router.push({
                name: 'NewVideo',
              })
            }}>
            {{
              default: () => '新建影视',
              icon: () => (
                <n-icon>
                  <Video />
                </n-icon>
              ),
            }}
          </n-button>
        ),
        key: 'new_video',
        show: computed(() => storeSign.is_sign),
      },
      {
        label: () => (
          <n-button
            text
            onClick={() => {
              router.push({
                name: 'Favorite',
              })
            }}>
            {{
              default: () => '求片列表',
              icon: () => (
                <n-icon>
                  <Dove />
                </n-icon>
              ),
            }}
          </n-button>
        ),
        key: 'home',
        show: computed(() => storeSign.is_sign),
      },
      {
        label: () => (
          <n-button
            text
            onClick={() => {
              router.push({
                name: 'Tool',
              })
            }}>
            {{
              default: () => '工具列表',
              icon: () => (
                <n-icon>
                  <Tools />
                </n-icon>
              ),
            }}
          </n-button>
        ),
        key: 'tool',
        show: computed(() => storeSign.is_sign),
      },
      {
        label: () => (
          <n-button
            text
            onClick={() => {
              router.push({
                name: 'Home',
              })
            }}>
            {{
              default: () => '控制台',
              icon: () => (
                <n-icon>
                  <Home />
                </n-icon>
              ),
            }}
          </n-button>
        ),
        key: 'home',
        show: computed(() => storeSign.is_sign),
      },
      {
        label: () => (
          <n-button
            text
            onClick={() => {
              storeSign.signOut()
            }}>
            {{
              default: () => '退出登录',
              icon: () => (
                <n-icon>
                  <SignOutAlt />
                </n-icon>
              ),
            }}
          </n-button>
        ),
        key: 'sign_out',
        show: computed(() => storeSign.is_sign),
      },
    ])
</script>
<style scoped lang="stylus"></style>
