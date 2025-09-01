import { createDiscreteApi, DiscreteApi } from 'naive-ui'

import themeStore from '@/stores/theme.ts'

let discrete: DiscreteApi = null

const discrete_api = () => {
  if (!discrete) {
    discrete = createDiscreteApi(['message', 'dialog', 'notification', 'loadingBar'], {
      configProviderProps: computed(() => ({
        theme: themeStore().getTheme,
      })),
    })
  }
  return discrete
}

export const nMessage = () => discrete_api().message
export const nDialog = () => discrete_api().dialog
export const nNotification = () => discrete_api().notification
export const nLoadingBar = () => discrete_api().loadingBar
