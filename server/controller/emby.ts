import { Hono } from 'hono'
import { GetFormatDate } from '@common/dayjs'

const emby = new Hono()

emby.get('/videoRequest', async (c) => {
  let emos_url = c.req.query('emos_url')
  if (!emos_url) {
    return c.text('error emos_url', 400)
  }

  try {
    let ip = c.req.header('Cf-Connecting-Ip'),
      ua = c.req.header('User-Agent').substring(0, 300),
      device_id = c.req.query('DeviceId').substring(0, 36),
      media_source_id = c.req.query('MediaSourceId').substring(0, 30),
      emos_url_decode = decodeURI(emos_url).substring(0, 400),
      api_key = c.req.query('api_key').substring(0, 32),
      time = GetFormatDate()

    await c.env.DB.prepare('INSERT INTO play_request (ip, ua, device_id, media_source_id, emos_url, api_key, time) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(ip, ua, device_id, media_source_id, emos_url_decode, api_key, time)
      .run()
    return c.redirect(emos_url_decode, 308)
  } catch (e) {
    console.error(`play_request db error ${e}`)
    return c.text('获取播放地址错误', 500)
  }
})

emby.post('/videoPlaying', async (c) => {
  try {
    const body = await c.req.json()
    let play_session_id = body.PlaySessionId.substring(0, 32),
      media_source_id = body.MediaSourceId.substring(0, 30),
      event_name = body.EventName.substring(0, 30),
      position_ticks = body.PositionTicks.toString().substring(0, 30),
      time = GetFormatDate()

    await c.env.DB.prepare('INSERT INTO play_history (play_session_id, media_source_id, event_name, position_ticks, time) VALUES (?, ?, ?, ?, ?)')
      .bind(play_session_id, media_source_id, event_name, position_ticks, time)
      .run()
  } catch (e) {
    console.error(`play_history db error ${e}`)
  }

  return c.text(null, 204)
})

export default emby
