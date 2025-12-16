<template>
  <div class="home p-40 max-sm:p-10">
    <n-card :title="`欢迎 ${data.email || ''}`">
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
          <p>
            求片或意见反馈等请提
            <n-button text tag="a" href="http://github.com/emosp/home/issues" target="_blank"> issues </n-button>
          </p>
          <p class="mt-1">
            感谢 <n-button text tag="a" href="https://pan.8897122.xyz/" target="_blank"> <span class="font-bold">Zn存档服</span> </n-button> 大力支持
          </p>
          <p class="mt-1">
            感谢 <n-button text tag="a" href="https://t.me/nyamedia_chat" target="_blank"> <span class="font-bold">Nya</span> </n-button> 大力支持
          </p>
          <p class="mt-1">
            感谢 <n-button text tag="a" href="https://t.me/yangzhazha_bot" target="_blank"> <span class="font-bold">yangzhazha</span> </n-button> 大力支持
          </p>
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
              <p>如果主线路卡顿 可选择 <n-button text tag="a" href="https://wiki.emos.lol/proxy.html" target="_blank"> 其他线路 </n-button></p>
            </template>
          </n-thing>
        </n-list-item>
      </n-list>
      <template #footer>
        <n-collapse @update:expanded-names="collapseExpanded" accordion>
          <n-collapse-item title="资源库" name="library">
            <n-list>
              <n-list-item v-for="row in library_datas" :key="row.library_id">
                <n-thing :title="row.name">
                  <template #header-extra>
                    <n-switch :value="row.is_select" :loading="row.loading" @update:value="librarySwitch(row)" />
                  </template>
                </n-thing>
              </n-list-item>
            </n-list>
          </n-collapse-item>
          <n-collapse-item title="绑定账号" name="oauth">
            <div class="mb-1" v-for="oauth in Oauths" :key="oauth.type">
              <n-popconfirm v-if="oauth_datas[oauth.type]" @positive-click="oauthUnbind(oauth.type)">
                <template #trigger>
                  <n-button block secondary strong>
                    <template #icon>
                      <component v-if="oauth.logo_component" :is="oauth.logo_component" />
                      <img v-else :src="oauth.logo" />
                    </template>
                    解绑 {{ oauth.label }} # {{ oauth_datas[oauth.type] }}
                  </n-button>
                </template>
                确认解绑?
              </n-popconfirm>
              <n-button v-else block secondary strong tag="a" :href="oauth_binds[oauth.type] || oauth.url">
                <template #icon>
                  <component v-if="oauth.logo_component" :is="oauth.logo_component" />
                  <img v-else :src="oauth.logo" />
                </template>
                绑定 {{ oauth.label }}
              </n-button>
            </div>
          </n-collapse-item>
          <n-collapse-item title="绑定邮箱" name="email" v-if="!data.email">
            <n-space vertical style="max-width: 400px">
              <n-form ref="email_ref" :model="email_data" :rules="email_rules">
                <n-form-item label="邮箱" path="email">
                  <n-input type="text" v-model:value="email_data.email" placeholder="请输入邮箱" clearable />
                </n-form-item>
                <n-form-item label="验证码" path="code">
                  <n-input type="text" v-model:value="email_data.code" placeholder="请输入验证码" clearable />
                  <n-button style="margin-left: 12px" @click="emailCodeGet" :loading="email_code_loading" :disabled="Boolean(email_code_waiting)">
                    {{ email_code_waiting ? `${email_code_waiting}s后重试` : '获取验证码' }}
                  </n-button>
                </n-form-item>
                <n-button :loading="email_submit_loading" @click="emailSubmit"> 提交 </n-button>
              </n-form>
            </n-space>
          </n-collapse-item>
          <n-collapse-item title="常见问题" name="qa">
            <n-list>
              <n-list-item>
                <n-thing title="为什么播放无时常 视频无参数等"> 目前正在思考如何搞定扫库问题 </n-thing>
              </n-list-item>
              <n-list-item>
                <n-thing title="为什么这么卡">
                  如果是页面卡请耐心多给他点时间 如果视频播放卡请提
                  <n-button text tag="a" href="http://github.com/emosp/home/issues" target="_blank"> issues </n-button>
                </n-thing>
              </n-list-item>
              <n-list-item>
                <n-thing title="为什么资源这么少">
                  定位是追新 如果等不及了可以自己来
                  <n-button text tag="a" href="https://uploader.emos.lol" target="_blank"> 上传 </n-button>
                </n-thing>
              </n-list-item>
            </n-list>
          </n-collapse-item>
          <n-collapse-item title="修改密码" name="updatePassword">
            <n-space vertical style="max-width: 400px">
              <n-form ref="passwordFormRef" :model="pwdForm" :rules="pwdRules">
                <n-form-item label="新密码" path="password">
                  <n-input type="password" v-model:value="pwdForm.password" show-password-on="click" clearable placeholder="新密码" />
                </n-form-item>
                <n-form-item label="确认密码" path="confirmPwd">
                  <n-input type="password" v-model:value="pwdForm.confirmPwd" show-password-on="click" clearable placeholder="确认密码" />
                </n-form-item>
                <n-form-item>
                  <n-button type="tertiary" :loading="passwordSubmitting" @click="submitPwd"> 提交 </n-button>
                </n-form-item>
              </n-form>
            </n-space>
          </n-collapse-item>
        </n-collapse>
      </template>
    </n-card>
  </div>
</template>
<script setup lang="ts">
  import { ref, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import instance from '@/utils/ky'
  import signStore from '@/stores/sign.ts'
  import { nMessage } from '@/utils/naive'
  import { Oauths } from '@/utils/oauth'
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

  const library_datas = ref([]),
    libraryGet = async () => {
      let data = await instance.get('/api/library').json()
      library_datas.value = data.libraries
    },
    librarySwitch = async (row) => {
      row.loading = true
      nMessage().info(`正在切换 ${row.name} 可见状态`)
      let is_select = !row.is_select
      await instance.put('/api/library', {
        json: {
          library_id: row.library_id,
          is_select,
        },
      })

      row.is_select = is_select
      row.loading = false
    }

  const oauth_datas = ref({}),
    oauth_binds = ref({}),
    oauthGet = async () => {
      let data = await instance.get('/api/oauth').json()
      oauth_datas.value = data.lists
      oauth_binds.value = data.binds
    },
    oauthUnbind = async (type: string) => {
      await instance
        .delete('/api/oauth/unbind', {
          json: {
            type,
          },
        })
        .then(() => {
          nMessage().success('解绑成功')
          delete oauth_datas.value[type]
        })
    }

  const collapseExpanded = (expanded_names?: array) => {
    if (expanded_names.includes('library') && !library_datas.value.length) {
      nMessage().info('加载资源库中')
      libraryGet()
    }
    if (expanded_names.includes('oauth') && !Object.keys(oauth_datas.value).length) {
      nMessage().info('加载账号中')
      oauthGet()
    }
    if (expanded_names.includes('updatePassword')) {
      pwdForm.password = ''
      pwdForm.confirmPwd = ''
    }
  }

  const email_ref = ref<FormInst | null>(null),
    email_data = ref<form_data>({
      email: '',
      code: '',
    }),
    email_rules: FormRules = {
      email: [
        {
          required: true,
          message: '请输入邮箱啊',
          trigger: ['input', 'blur'],
        },
        {
          message: '感觉输入的不太对',
          type: 'email',
          trigger: ['input', 'blur'],
        },
      ],
      code: [
        {
          required: true,
          message: '请输入验证码呀',
          trigger: ['input', 'blur'],
        },
      ],
    },
    email_submit_loading = ref(false),
    email_code_loading = ref(false),
    email_code_waiting = ref(0),
    emailCodeGet = async () => {
      await email_ref.value.validate(
        (error) => {},
        (rule) => {
          return rule.type == 'email'
        },
      )

      let email = email_data.value.email
      if (!email) {
        nMessage().error('要输入邮箱')
        return
      }

      email_code_loading.value = false
      await instance
        .post('api/email/send', {
          json: {
            email,
          },
        })
        .then(() => {
          nMessage().success('验证码发送成功')
        })
        .finally(() => {
          email_code_loading.value = false
        })

      email_data.value.email_code = null
      email_code_waiting.value = 59

      let timer = setInterval(() => {
        if (email_code_waiting.value < 1) {
          clearInterval(timer)
          email_code_waiting.value = 0
        } else {
          email_code_waiting.value--
        }
      }, 1000)
    },
    emailSubmit = async () => {
      await email_ref.value.validate()
      email_submit_loading.value = true
      await instance
        .post('api/email/bind', {
          json: email_data.value,
        })
        .then(() => {
          nMessage().success('绑定成功')
          data.value.email = email_data.value.email
        })
        .finally(() => {
          email_submit_loading.value = false
          email_data.value.code = ''
        })
    }

  // 修改密码
  const passwordFormRef = ref(null)
  const passwordSubmitting = ref(false)
  const pwdForm = reactive({
    password: '',
    confirmPwd: '',
  })
  const pwdRules = {
    password: [
      {
        required: true,
        message: '请输入新密码',
        trigger: 'blur',
      },
    ],
    confirmPwd: [
      {
        required: true,
        message: '请确认新密码',
        trigger: 'blur',
      },
      {
        validator: (rule, value: string) => {
          return value === pwdForm.password
        },
        message: '两次密码输入不一致',
        trigger: ['input', 'blur'],
      },
    ],
  }

  const submitPwd = () => {
    passwordFormRef.value?.validate((errors) => {
      if (errors) {
        return
      }

      passwordSubmitting.value = true
      instance
        .post('/api/user/changePassword', {
          json: {
            password: pwdForm.password,
          },
        })
        .then((res) => {
          nMessage().success('密码修改成功')
          pwdForm.password = ''
          pwdForm.confirmPwd = ''
          passwordSubmitting.value = false
        })
        .catch((err) => {
          passwordSubmitting.value = false
        })
    })
  }
</script>
<style scoped lang="stylus"></style>
