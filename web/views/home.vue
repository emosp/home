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
          <p>
            求片或意见反馈等请提
            <n-button text tag="a" href="http://github.com/emosp/home/issues" target="_blank"> issues </n-button>
          </p>
          <p class="mt-1">
            感谢 <n-button text tag="a" href="https://pan.8897122.xyz/" target="_blank"> <span class="font-bold">Zn存档服</span> </n-button> 大力支持
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
            </template>
          </n-thing>
        </n-list-item>
      </n-list>
      <template #footer>
        <n-collapse @update:expanded-names="collapseExpanded" accordion>
          <n-collapse-item title="资源库" name="library">
            <n-list>
              <n-list-item v-for="row in library_datas" :key="row.library_uuid">
                <n-thing :title="row.name">
                  <template #header-extra>
                    <n-switch :value="row.is_select" :loading="row.loading" @update:value="librarySwitch(row)" />
                  </template>
                </n-thing>
              </n-list-item>
            </n-list>
          </n-collapse-item>
          <n-collapse-item title="切换线路" name="line">
            <n-radio-group v-model:value="line_datas.selected" name="line" @change="lineSwitch">
              <div>
                <n-radio value="default"> 默认 (无cf优选) </n-radio>
              </div>
              <div v-for="line in line_datas.lines" :key="line">
                <n-radio :value="line">
                  {{ line }}
                </n-radio>
              </div>
            </n-radio-group>
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
              <n-button v-else block secondary strong tag="a" :href="oauth.url">
                <template #icon>
                  <component v-if="oauth.logo_component" :is="oauth.logo_component" />
                  <img v-else :src="oauth.logo" />
                </template>
                绑定 {{ oauth.label }}
              </n-button>
            </div>
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
                  <n-button
                    text
                    @click="
                      () => {
                        router.push({
                          name: 'Upload',
                        })
                      }
                    ">
                    上传
                  </n-button>
                </n-thing>
              </n-list-item>
            </n-list>
          </n-collapse-item>
        </n-collapse>
      </template>
    </n-card>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue'
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
          library_uuid: row.library_uuid,
          is_select,
        },
      })

      row.is_select = is_select
      row.loading = false
    }

  const line_datas = ref({
      lines: [],
      selected: null,
    }),
    lineGet = async () => {
      line_datas.value = await instance.get('/api/line').json()
    },
    lineSwitch = async () => {
      let line = line_datas.value.selected
      await instance
        .put('/api/line', {
          json: {
            line,
          },
        })
        .then(() => {
          nMessage().success(`已在切换为 ${line} 线路 重新进视频详情页播放即可`)
        })
    }

  const oauth_datas = ref({}),
    oauthGet = async () => {
      oauth_datas.value = await instance.get('/api/oauth').json()
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
    if (expanded_names.includes('line') && !line_datas.value.lines.length) {
      nMessage().info('加载线路中')
      lineGet()
    }
    if (expanded_names.includes('oauth') && !Object.keys(oauth_datas.value).length) {
      nMessage().info('加载账号中')
      oauthGet()
    }
  }
</script>
<style scoped lang="stylus"></style>
