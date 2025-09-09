import { Hono } from 'hono'
import * as db from '@server/db'

const emby = new Hono()

/**
 * 此处 emby 会请求多次 暂不清楚什么原因
 * todo: 缓存
 */
emby.get('/videoRequest', async (c) => {
  let body = c.req.query('emos_data')
  if (!body) {
    return c.text('error emos_data', 400)
  }

  let responseError = (message) => c.text(message, 500)

  let emos_body: string,
    emos_data: {
      type: string
      url: string
      line: string
      time: number
    } = {}

  try {
    emos_body = atob(decodeURIComponent(body)).substring(0, 500)
    emos_data = JSON.parse(emos_body)
  } catch (e) {
    console.error(`play_request error base64 decode ${body}`)
    return responseError('error decode emos_data')
  }

  await db
    .init(c.env)
    .insert(db.schema.play_request)
    .values({
      ip: c.req.header('Cf-Connecting-Ip'),
      ua: c.req.header('User-Agent').substring(0, 300),
      device_id: c.req.query('DeviceId').substring(0, 36),
      media_source_id: c.req.query('MediaSourceId').substring(0, 30),
      emos_data: emos_body,
      api_key: c.req.query('api_key').substring(0, 32),
    })

  let play_url = null,
    emos_url = emos_data.url

  switch (emos_data.type) {
    case 'r2':
      let user_line = emos_data.line
      play_url = user_line == 'default' ? `${c.env.VIDEO_PLAY_TYPE_R2_URL}${emos_url}` : `https://cdn-${user_line}.emos.lol${emos_url}`
      break

    case 'url':
      play_url = emos_url
      break

    case 'external_zn':
      play_url = `${c.env.VIDEO_PLAY_TYPE_EXTERNAL_ZN_URL}${emos_url}`
      break

    default:
      break
  }

  if (!play_url) {
    return responseError('获取播放地址错误')
  }

  return c.redirect(play_url, 308)
})

emby.post('/videoPlaying', async (c) => {
  try {
    const body = await c.req.json()
    let play_session_id = body.PlaySessionId.substring(0, 32),
      media_source_id = body.MediaSourceId.substring(0, 30),
      event_name = body.EventName.substring(0, 30),
      position_ticks = body.PositionTicks.toString().substring(0, 30)

    await db.init(c.env).insert(db.schema.play_history).values({
      play_session_id,
      media_source_id,
      event_name,
      position_ticks,
    })
  } catch (e) {
    console.error(`play_history error ${e}`)
  }

  return c.text(null, 204)
})

export default emby
