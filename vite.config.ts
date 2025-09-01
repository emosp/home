import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    define: {
      // https://developers.cloudflare.com/turnstile/troubleshooting/testing/
      'import.meta.env.TURNSTILE_SITE_KEY': `'${mode == 'production' ? env.TURNSTILE_SITE_KEY : '1x00000000000000000000AA'}'`,
    },
    build: {
      cssCodeSplit: false,
    },
    plugins: [
      vue(),
      vueJsx(),
      cloudflare(),
      tailwindcss(),
      AutoImport({
        imports: [
          'vue',
          {
            'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar'],
          },
        ],
      }),
      Components({
        dirs: ['web/components'],
        resolvers: [NaiveUiResolver()],
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./web', import.meta.url)),
        '@common': fileURLToPath(new URL('./common', import.meta.url)),
        '@server': fileURLToPath(new URL('./server', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
      },
    },
  }
})
