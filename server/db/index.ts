import { drizzle } from 'drizzle-orm/d1'
import { play_request } from '@server/db/schema/play_request'
import { play_history } from '@server/db/schema/play_history'

export const schema = {
  play_request,
  play_history,
}

export const init = (env: HonoBindings) =>
  drizzle(env.DB, {
    schema,
  })
