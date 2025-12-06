import { Hono } from 'hono'

import { GetFormatDate } from '@common/dayjs'
import { DecodeApi } from '@server/utils'
import { proxy } from 'hono/proxy'

const app = new Hono().basePath('/server/')

app.get('/', (c) => {
  return c.json({
    time: GetFormatDate(),
    version: c.env.VERSION,
  })
})

app.get('/play/gd', async (c) => {
  let url = c.req.query('url')
  if (!url) {
    c.status(422)
    return c.text('no url')
  }

  let data: {
    file_id: string
    token: string
    time: number
  } = await DecodeApi(c.env.HOME_AES_KEY, decodeURIComponent(url))

  let file_id = data?.file_id
  if (!file_id) {
    c.status(422)
    return c.text('error url')
  }

  if (Math.floor(Date.now() / 1000) - data.time > 60 * 60 * 5) {
    c.status(403)
    return c.text('url expired')
  }

  let req_header = c.req.header()

  let res = await proxy(`https://www.googleapis.com/drive/v3/files/${file_id}?alt=media&source=downloadUrl`, {
    headers: {
      Authorization: `Bearer ${data.token}`,
      'user-agent': req_header['user-agent'],
      range: req_header['range'],
    },
  })

  let res_status = res.status
  if (res_status >= 400) {
    console.error(`play gd proxy error: ${res.status} - ${file_id} `)
    c.status(res_status)
    return c.text(`error ${res_status}`)
  }

  res.headers.delete('x-goog-hash')
  res.headers.delete('x-guploader-uploadid')
  res.headers.delete('server')
  return res
})

app.get('/play/od', async (c) => {
  let url = c.req.query('url')
  if (!url) {
    c.status(422)
    return c.text('no url')
  }

  let data: {
    play_url: string
    time: number
  } = await DecodeApi(c.env.HOME_AES_KEY, decodeURIComponent(url))

  let play_url = data?.play_url
  if (!play_url) {
    c.status(422)
    return c.text('error url')
  }

  if (Math.floor(Date.now() / 1000) - data.time > 60 * 60 * 2) {
    c.status(403)
    return c.text('url expired')
  }

  let req_header = c.req.header()

  let res = await proxy(play_url, {
    headers: {
      'user-agent': req_header['user-agent'],
      range: req_header['range'],
    },
  })

  let res_status = res.status
  if (res_status >= 400) {
    console.error(`play od proxy error: ${res.status} - ${file_id} `)
    c.status(res_status)
    return c.text(`error ${res_status}`)
  }

  res.headers.delete('content-security-policy')
  res.headers.delete('report-to')
  return res
})

export default app
