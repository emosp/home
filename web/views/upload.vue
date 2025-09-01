<template>
  <div class="flex justify-center min-md:mt-10">
    <n-card class="min-md:max-w-2/3" title="资源上传">
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
      <template #default>
        <n-form ref="form_ref" :model="form_data" :rules="form_rules" label-placement="left" label-width="auto">
          <n-form-item label="媒体库" path="library_uuid">
            <n-select
              v-model:value="form_data.library_uuid"
              placeholder="请选择要上传的媒体库"
              :options="base_data.libraries"
              @update:value="changeLibrary"
              label-field="name"
              value-field="uuid"
              filterable
              clearable />
          </n-form-item>
          <n-form-item label="资源名" v-show="form_data.library_type">
            <n-grid :cols="24" item-responsive>
              <n-form-item-gi path="search_type" span="24 400:6">
                <n-switch v-model:value="form_data.search_type" checked-value="tmdb_id" unchecked-value="name" @change="resetMediaData('search_type')">
                  <template #checked>用 TMDB ID 查</template>
                  <template #unchecked>用名字查</template>
                </n-switch>
              </n-form-item-gi>
              <n-form-item-gi path="tmdb_id" span="24 400:18">
                <n-select
                  v-model:value="form_data.search_value"
                  placeholder="请搜索要上传的资源名称"
                  :options="search_media_options"
                  :loading="search_media_loading"
                  @search="searchMedia"
                  @change="changeMedia"
                  label-field="label"
                  value-field="tmdb_id"
                  filterable
                  clearable
                  remote>
                  <template #action>
                    使用
                    <n-button text tag="a" href="https://www.themoviedb.org/" target="_blank"> TMDB </n-button>
                    进行查询
                  </template>
                  <template #empty>
                    {{ search_media_loading ? '搜索中...' : '输入影视名称' }}
                  </template>
                </n-select>
              </n-form-item-gi>
            </n-grid>
          </n-form-item>

          <template v-if="form_data.library_type == 'tv'">
            <n-form-item label="选择季" path="season_number">
              <n-select
                v-model:value="form_data.season_number"
                placeholder="请选择季数"
                :options="search_media_season_options"
                @update:value="changeSeason"
                label-field="label"
                value-field="season_number"
                filterable
                clearable />
            </n-form-item>

            <n-form-item label="选择集" path="episode_number" v-show="form_data.season_number !== null">
              <n-select
                v-model:value="form_data.episode_number"
                placeholder="请选择集数"
                :options="search_media_episode_options"
                label-field="label"
                value-field="episode_number"
                filterable
                clearable />
            </n-form-item>
          </template>

          <n-form-item label="分辨率" path="resolution" v-show="form_data.library_type">
            <n-select
              v-model:value="form_data.resolution"
              placeholder="请选择上传资源分辨率"
              :options="base_data.resolutions"
              label-field="resolution"
              value-field="resolution"
              filterable />
          </n-form-item>

          <n-form-item path="path_url" v-if="form_data.resolution">
            <!--             accept="video/*"-->
            <n-upload directory-dnd :max="1" @update:file-list="changeFileList" :custom-request="uploadFileRequest">
              <n-upload-dragger>
                <div class="mt-4">
                  <n-icon size="48" :depth="3">
                    <Upload />
                  </n-icon>
                </div>
                <n-text style="font-size: 16px"> 点击或者拖动视频文件到该区域来上传 </n-text>
                <n-p depth="3" class="mt-8"> 上传测试库可以实时看到 其他库需要等审核后入库 </n-p>
              </n-upload-dragger>
            </n-upload>
          </n-form-item>
        </n-form>
        <n-button type="primary" block secondary strong :loading="form_loading" @click="formSubmit">提交</n-button>
      </template>
    </n-card>
  </div>
</template>
<script setup lang="ts">
  import { Upload } from '@vicons/fa'
  import { useDebounceFn } from '@vueuse/core'
  import { ref } from 'vue'
  import instance from '@/utils/ky'
  import { uploadFileRequest } from '@/utils/file'

  import { useRouter } from 'vue-router'
  import { FormInst, FormRules, UploadFileInfo } from 'naive-ui'
  import { nMessage, nNotification } from '@/utils/naive'
  const router = useRouter()

  const form_ref = ref<FormInst | null>(null),
    form_data = ref({
      library_uuid: null,
      library_type: null,
      search_type: 'name',
      search_value: null,
      tmdb_id: null,
      season_number: null,
      episode_number: null,
      resolution: null,
      path_url: null,
    }),
    form_rules: FormRules = {
      library_uuid: [
        {
          required: true,
          trigger: ['change', 'blur'],
          message: '',
        },
      ],
      search_value: [
        {
          required: true,
          trigger: ['change', 'blur'],
        },
      ],
      tmdb_id: [
        {
          required: true,
          trigger: ['change', 'blur'],
          type: 'number',
          message: '',
        },
      ],
      season_number: [
        {
          required: true,
          trigger: ['change', 'blur'],
          type: 'number',
          message: '',
        },
      ],
      episode_number: [
        {
          required: true,
          trigger: ['change', 'blur'],
          type: 'number',
          message: '',
        },
      ],
      resolution: [
        {
          required: true,
          trigger: ['change', 'blur'],
          type: 'string',
          message: '',
        },
      ],
      path_url: [
        {
          required: true,
          trigger: ['change', 'blur'],
          type: 'string',
          message: '需要上传视频或输入地址呀',
        },
      ],
    },
    form_loading = ref(false),
    formSubmit = async () => {
      await form_ref.value?.validate()
      form_loading.value = true

      let data = form_data.value

      instance
        .post('/api/upload/save', {
          json: {
            tmdb_id: data.tmdb_id,
            library_uuid: data.library_uuid,
            season_number: data.season_number,
            episode_number: data.episode_number,
            path_url: data.path_url,
            resolution: data.resolution,
          },
        })
        .then(async (res) => {
          let { count } = await res.json()

          nNotification().success({
            title: '提交成功',
            description: `这是您提交的第 ${count} 个资源`,
            duration: 3000,
          })

          resetMediaData('all')
        })
        .finally(() => {
          form_loading.value = false
        })
    }

  const base_data = ref({}),
    getBase = async () => {
      let data = await instance.get('/api/upload/base').json()

      let resolutions = []
      for (let resolution of data.resolutions) {
        resolutions.push({
          resolution,
        })
      }

      base_data.value = {
        ...data,
        resolutions,
      }
    }

  getBase()

  const resetMediaData = (type) => {
    switch (type) {
      case 'all':
        search_media_loading.value = false
        search_media_options.value = []
        search_media_season_options.value = []
        search_media_episode_options.value = []
        form_data.value.library_uuid = null
        form_data.value.library_type = null
        form_data.value.search_type = null
        form_data.value.search_value = null
        form_data.value.tmdb_id = null
        form_data.value.season_number = null
        form_data.value.episode_number = null
        form_data.value.resolution = null
        form_data.value.path_url = null
        break
      case 'search_type':
        form_data.value.search_value = null
        break
      case 'library':
        search_media_loading.value = false
        search_media_options.value = []
        search_media_season_options.value = []
        search_media_episode_options.value = []
        form_data.value.search_value = null
        form_data.value.tmdb_id = null
        form_data.value.season_number = null
        form_data.value.episode_number = null
        break
      case 'media':
        search_media_season_options.value = []
        search_media_episode_options.value = []
        form_data.value.tmdb_id = null
        form_data.value.season_number = null
        form_data.value.episode_number = null
        break
      case 'season':
        search_media_episode_options.value = []
        form_data.value.episode_number = null
        break
      default:
        break
    }
  }

  const changeLibrary = (value, option) => {
    resetMediaData('library')
    form_data.value.library_type = option?.type
  }

  const search_media_options = ref([]),
    search_media_loading = ref(false),
    searchMedia = useDebounceFn(
      async (value) => {
        search_media_loading.value = true
        let { library_type, search_type } = form_data.value
        instance
          .get('/api/upload/search/media', {
            searchParams: {
              library_type,
              search_type,
              search_value: value,
            },
          })
          .then(async (res) => {
            search_media_options.value = (await res.json()).map((item) => {
              item.label = `${item.date_air} # ${item.name} - ${item.description}`
              return item
            })
          })
          .finally(() => {
            search_media_loading.value = false
          })
      },
      800,
      {
        maxWait: 1000,
      },
    ),
    changeMedia = async (value, option) => {
      resetMediaData('media')
      form_data.value.tmdb_id = value
      if (!value) {
        return
      }

      if (form_data.value.library_type == 'tv') {
        let seasons = option.seasons
        if (!seasons.length) {
          nMessage().info('正在获取季信息')
          seasons = await instance
            .get('/api/upload/search/mediaTvSeasons', {
              searchParams: {
                tv_id: value,
              },
            })
            .json()
        }
        search_media_season_options.value = seasons.map((item) => {
          item.label = `${item.date_air} # ${item.name} - ${item.description}`
          return item
        })
      }
    }

  const search_media_season_options = ref([])

  const search_media_episode_options = ref([]),
    changeSeason = async (value, option) => {
      resetMediaData('season')

      // 季有特别篇
      if (value === null) {
        return
      }

      nMessage().info('正在获取集信息')
      let episodes = await instance
        .get('/api/upload/search/mediaTvEpisode', {
          searchParams: {
            tv_id: form_data.value.tmdb_id,
            season_number: value,
          },
        })
        .json()

      search_media_episode_options.value = episodes.map((item) => {
        item.label = `${item.date_air} # 第 ${item.episode_number} 集 - ${item.name}`
        return item
      })
    }

  const changeFileList = (file_lists: Array<UploadFileInfo>) => {
    form_data.value.path_url = file_lists[0]?.fullPath
  }
</script>
<style scoped lang="stylus"></style>
