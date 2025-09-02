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
          求片或意见反馈等请提
          <n-button text tag="a" href="http://github.com/emosp/home/issues" target="_blank"> issues </n-button>
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

  const collapseExpanded = (expanded_names?: array) => {
    if (expanded_names.includes('library') && !library_datas.value.length) {
      nMessage().info('加载资源库中')
      libraryGet()
    }
  }
</script>
<style scoped lang="stylus"></style>
