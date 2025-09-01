import { sql } from 'drizzle-orm'
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import * as t from 'drizzle-orm/sqlite-core'

export const play_request = sqliteTable(
  'play_request',
  {
    id: integer('id').primaryKey({
      autoIncrement: true,
    }),
    ip: text('ip'),
    ua: text('ua'),
    device_id: text('device_id'),
    media_source_id: text('media_source_id'),
    emos_data: text('emos_data'),
    api_key: text('api_key'),
    timestamp: integer('timestamp', {
      mode: 'timestamp',
    })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    // prettier-ignore
    t.index('play_request_device_id').on(table.device_id),
    t.index('play_request_media_source_id').on(table.media_source_id),
    t.index('play_request_timestamp').on(table.timestamp),
  ],
)
