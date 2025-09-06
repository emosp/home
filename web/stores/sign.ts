import { defineStore } from 'pinia'
import { Ref, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_NAME_INDEX } from '@/router'
import instance from '@/utils/ky'

type Type = Ref<'in' | 'reg'>

export default defineStore(
  'sign',
  () => {
    const type: Type = ref('in'),
      show = ref(false)

    const showEntry = () => {
      show.value = true
    }

    const user_token = ref(),
      user_username = ref(),
      is_sign = computed(() => Boolean(user_token.value))

    const tokenRemove = () => {
        user_token.value = null
      },
      signEntry = (username: string, token: string) => {
        user_username.value = username
        user_token.value = token
      },
      signOut = async () => {
        tokenRemove()
        await instance.put('/api/sign/out')

        await useRouter().replace({
          name: ROUTE_NAME_INDEX,
        })
      }

    return {
      type,
      show,
      user_token,
      user_username,
      is_sign,
      showEntry,
      signEntry,
      signOut,
      tokenRemove,
    }
  },
  {
    persist: {
      pick: ['user_token', 'user_username'],
    },
  },
)
