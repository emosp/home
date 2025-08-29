import ky from 'ky'
import signStore from '@/stores/sign.ts'
import router, { ROUTE_NAME_INDEX } from '@/router'
import { nLoadingBar, nMessage } from '@/utils/naive'

const instance = ky.create({
  timeout: 1000 * 30,
  retry: 0,
  hooks: {
    beforeRequest: [
      () => {
        nLoadingBar().start()
      },
      (request) => {
        let token = signStore().user_token

        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        switch (response.status) {
          case 401:
            nMessage().error('登录失效')
            signStore().tokenRemove()
            await router.push({
              name: ROUTE_NAME_INDEX,
            })
            break
          case 422:
            nMessage().warning(((await response.json()) as any).error)
            break
          case 500:
            nMessage().error('系统错误 请稍后再试')
            break
        }

        if (response.ok) {
          nLoadingBar().finish()
        } else {
          nLoadingBar().error()
        }
      },
    ],
  },
})

export default instance
