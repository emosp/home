import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useOsTheme, lightTheme, darkTheme } from 'naive-ui'

const THEME_AUTO = 'auto'

export default defineStore(
  'theme',
  () => {
    const theme = ref(THEME_AUTO),
      theme_os = useOsTheme(),
      theme_name = computed(() => (theme.value == THEME_AUTO ? theme_os.value : theme.value)),
      getTheme = computed(() => (theme_name.value == 'light' ? lightTheme : darkTheme)),
      changeTheme = (value: string) => (theme.value = value),
      triggerTheme = () => changeTheme(theme_name.value == 'light' ? 'dark' : 'light')

    return {
      theme,
      theme_os,
      theme_name,
      getTheme,
      changeTheme,
      triggerTheme,
    }
  },
  {
    persist: {
      paths: ['theme'],
    },
  },
)
