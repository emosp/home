import { Hono } from 'hono'

import { GetFormatDate } from '@common/dayjs'
import emby from '@server/controller/emby.ts'

const app = new Hono().basePath('/server/')
app.route('/emby', emby)

app.get('/', (c) => {
  return c.json({
    time: GetFormatDate(),
    version: c.env.VERSION,
  })
})

export default app
