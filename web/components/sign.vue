<template>
  <n-modal
    class="sign max-sm:max-w-11/12 max-w-96"
    v-model:show="storeSign.show"
    preset="card"
    size="small"
    :mask-closable="false"
    :bordered="false"
    title="登录 / 注册"
    content-style="padding: 10px">
    <template #footer>
      <p>未注册的账号将自动注册</p>

      <n-divider dashed> 或 </n-divider>

      <div class="mb-1" v-for="oauth in Oauths" :key="oauth.type">
        <n-button block secondary strong tag="a" :href="oauth.url">
          <template #icon>
            <component v-if="oauth.logo_component" :is="oauth.logo_component" />
            <img v-else :src="oauth.logo" />
          </template>
          用 {{ oauth.label }} 登录
        </n-button>
      </div>
    </template>
    <n-form ref="form_ref" :model="form_data" :rules="form_rules">
      <n-form-item label="账号" path="username">
        <n-input v-model:value="form_data.username" placeholder="请输入账号" clearable @change="getHasUsername" />
      </n-form-item>
      <n-form-item label="密码" path="password">
        <n-input type="password" show-password-on="click" v-model:value="form_data.password" maxlength="30" placeholder="请输入密码" @keyup.enter.prevent="formSubmit" clearable />
      </n-form-item>
      <n-form-item :show-label="false" path="turnstile">
        <VueTurnstile ref="form_turnstile" :site-key="form_turnstile_site_key" size="flexible" appearance="always" v-model="form_data.turnstile" class="w-full"></VueTurnstile>
      </n-form-item>
    </n-form>
    <n-button type="primary" block secondary strong :loading="form_loading" @click="formSubmit"> {{ form_submit_name }} </n-button>
  </n-modal>
</template>
<script setup lang="ts">
  import VueTurnstile from 'vue-turnstile'
  import { ref, watch } from 'vue'
  import { FormInst, FormRules, FormItemRule } from 'naive-ui'
  import instance from '@/utils/ky'
  import { nMessage } from '@/utils/naive'
  import { Oauths } from '@/utils/oauth'
  import { ROUTE_NAME_LINK } from '@/router'

  import { useRoute, useRouter } from 'vue-router'
  const router = useRouter(),
    route = useRoute()

  import signStore from '@/stores/sign.ts'
  const storeSign = signStore()

  interface form_data {
    username: string
    password: string
    turnstile: string
  }

  const form_ref = ref<FormInst | null>(null),
    form_turnstile_site_key = import.meta.env.TURNSTILE_SITE_KEY,
    form_turnstile = ref(),
    form_data = ref<form_data>({
      username: storeSign.user_username,
      password: '',
      turnstile: '',
    }),
    form_rules: FormRules = {
      username: [
        {
          required: true,
          message: '请输入账号',
          trigger: ['input', 'blur'],
        },
        {
          required: true,
          validator: (rule: FormItemRule, value: string) => {
            if (!value) {
              return true
            }
            return /^[a-zA-Z0-9]{4,16}$/.test(value)
          },
          trigger: ['blur'],
          message: '只支持4到16位的数字、字母作为emby登录账号',
          name: 'rule_username_format',
        },
      ],
      password: [
        {
          required: true,
          message: '请输入密码',
          trigger: ['input', 'blur'],
        },
      ],
      turnstile: [
        {
          required: true,
          message: '请完成验证',
          trigger: ['blur'],
        },
      ],
    },
    form_loading = ref(false),
    form_submit_name = ref(null),
    formSubmitNameDefault = () => {
      form_submit_name.value = '进入'
    },
    formSubmit = async () => {
      await form_ref.value?.validate()

      form_loading.value = true

      let username = form_data.value.username

      instance
        .post('/api/sign/entry', {
          json: form_data.value,
        })
        .then(async (res) => {
          let { avatar, token } = await res.json()
          if (token) {
            storeSign.signEntry(username, avatar, token)

            nMessage().success(`欢迎回来 ${username}`, {
              showIcon: false,
            })

            storeSign.show = false

            switch (route.name) {
              case ROUTE_NAME_LINK:
                // todo: 优雅的实现
                window.location.reload()
                break
              default:
                await router.push({
                  name: 'Home',
                })
                break
            }
          } else {
            nMessage().error('密码错误')
          }
        })
        .finally(() => {
          form_loading.value = false
          form_turnstile.value.reset()
          form_data.value.turnstile = ''
        })
    }

  formSubmitNameDefault()

  watch(
    () => storeSign.show,
    () => {
      formSubmitNameDefault()
    },
  )

  const getHasUsername = async (username) => {
    if (!username) {
      formSubmitNameDefault()
      return
    }

    await form_ref.value.validate(
      (error) => {
        if (error) {
          formSubmitNameDefault()
        }
      },
      (rule) => rule.name == 'rule_username_format',
    )

    let { user_is_exist } = await instance
      .post('/api/sign/check', {
        json: {
          username,
        },
      })
      .json()

    if (user_is_exist) {
      form_submit_name.value = '登录'
    } else {
      form_submit_name.value = '注册'
    }
  }
</script>
<style scoped lang="stylus">
  .n-divider
      margin-top: 4px
      margin-bottom: 8px
</style>
