<template>
  <div class="flex justify-center min-md:mt-10">
    <n-card class="min-md:max-w-2/3" title="新建影视">
      <template #header-extra>
        <n-button
          text
          @click="
            () => {
              router.push({
                name: ROUTE_NAME_INDEX,
              })
            }
          ">
          回主页
        </n-button>
      </template>
      <template #default>
        <p>仅在 <n-button text tag="a" href="https://www.themoviedb.org" target="_blank"> tmdb </n-button> 无内容时上传电影使用, 非求片区.</p>
        <br />
        <n-form ref="form_ref" :model="form_data" :rules="form_rules" label-placement="left" :label-width="80">
          <n-form-item label="媒体库" path="library_id">
            <n-select v-model:value="form_data.library_id" placeholder="请选择所属媒体库" :options="libraries" label-field="name" value-field="library_id" filterable />
          </n-form-item>

          <n-form-item label="名称" path="video_title">
            <n-input v-model:value="form_data.video_title" type="text" placeholder="请输入剧名" :maxlength="50" clearable />
          </n-form-item>
          <n-form-item label="简介" path="video_description">
            <n-input v-model:value="form_data.video_description" type="textarea" placeholder="请输入描述啥的" :maxlength="200" show-count clearable />
          </n-form-item>
          <n-form-item label="封面图" path="cover_id" v-if="form_data.library_id">
            <n-upload
              :max="1"
              accept="image/*"
              @update-file-list="
                (file_lists) => {
                  form_data.cover_id = file_lists[0]?.fullPath
                }
              "
              :custom-request="uploadFileRequest"
              list-type="image-card">
              点击上传
            </n-upload>
          </n-form-item>
        </n-form>
        <n-button type="primary" block secondary strong :loading="form_loading" @click="formSubmit">提交</n-button>
      </template>
    </n-card>
  </div>
</template>
<script setup lang="ts">
  import { useClipboard } from '@vueuse/core'
  import { computed, ref } from 'vue'
  import instance from '@/utils/ky'
  import { uploadFileRequest } from '@/utils/file'

  import { useRouter } from 'vue-router'
  import { FormInst, FormRules } from 'naive-ui'
  import { nDialog, nMessage } from '@/utils/naive'
  import { ROUTE_NAME_INDEX } from '@/router'
  const router = useRouter()

  const form_ref = ref<FormInst | null>(null),
    form_data_default = {
      library_id: null,
      video_title: null,
      video_description: null,
      cover_id: null,
    },
    form_data = ref({}),
    form_rules: FormRules = {
      library_id: [
        {
          required: true,
          trigger: ['change', 'blur'],
          message: '',
        },
      ],
      video_title: [
        {
          required: true,
          trigger: ['input'],
          type: 'string',
          message: '',
        },
      ],
      cover_id: [
        {
          required: true,
          trigger: ['change', 'blur'],
          type: 'string',
          message: '需要上传封面',
        },
      ],
    },
    form_loading = ref(false),
    formReset = () => {
      form_data.value = Object.assign({}, form_data_default)
    },
    formSubmit = async () => {
      await form_ref.value?.validate()
      form_loading.value = true

      let data = form_data.value

      instance
        .post('/api/video/create', {
          json: data,
        })
        .then(async (res) => {
          let { item_id } = await res.json()
          let { copy } = useClipboard()

          nDialog().success({
            title: '影视创建成功',
            content: `视频id为: ${item_id}`,
            showIcon: false,
            positiveText: '点击复制',
            onPositiveClick: () => {
              copy(item_id)
              nMessage().success('复制成功')
            },
          })

          formReset()
        })
        .finally(() => {
          form_loading.value = false
        })
    }

  const libraries = ref([]),
    getLibrary = async () => {
      let data = await instance.get('/api/library').json()
      libraries.value = data.libraries.map((row) => {
        return {
          ...row,
          library_id: row.library_id.toString(),
        }
      })
    }

  formReset()
  getLibrary()
</script>
<style scoped lang="stylus"></style>
