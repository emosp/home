<template>
  <div class="summary">
    <div class="text-center mt-10">
      <p class="font-mono text-3xl">2025用户年度总结</p>
    </div>

    <div class="font-mono mt-5 text-2xl whitespace-break-spaces">
      <span ref="text"></span>
      <div v-if="loading" class="text-center">
        <n-spin size="small" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue'
  import instance from '@/utils/ky'
  import TypeIt from 'typeit'
  import prettyBytes from 'pretty-bytes'

  import { useRouter } from 'vue-router'
  const router = useRouter()

  const text = ref()

  const loading = ref(true),
    start = async () => {
      let res = await instance.get('/api/summary/year2025').json()
      loading.value = false

      let texts = []
      texts.push(`你好 <code>${res.username}</code>，不知不觉你已经来这 ${res.join_days} 天啦! 🎉`)
      texts.push(`今年获得了 ${res.point_earn} 🥕 以及消费了 ${res.point_const} 🥕 `)
      texts.push(`签到了 ${res.continuous_days} 次 🥹`)
      texts.push(`看了 ${res.play_count} 次剧， 看完了 ${res.play_complete_count} 次剧`)
      texts.push(`求了 ${res.seek_count_request} 次片， 响应了 ${res.seek_count_reply} 次求片`)
      texts.push(`在群里聊了 ${res.chat_count} 次，邀请了 ${res.invite_count} 人`)
      texts.push(`传了 ${res.upload_video_subtitle_count} 次字幕，上传了 ${res.upload_video_media_count} 个媒体，总上传量达到了 ${prettyBytes(res.upload_video_media_sum_size)} 👏`)

      new TypeIt(text.value, {
        strings: texts.map((row) => `  ${row} \n`),
        speed: 50,
        waitUntilVisible: true,
        afterComplete: (instance) => instance.destroy(),
      })
        .type(`\n`)
        .type(`  愿你集邮半生，归来仍是emos。`)
        .delete(9)
        .type(`仍然记得emos。`)
        .go()
    }

  start()
</script>
<style scoped lang="stylus"></style>
