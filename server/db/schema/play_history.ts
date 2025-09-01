import { sql } from 'drizzle-orm'
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import * as t from 'drizzle-orm/sqlite-core'

export const play_history = sqliteTable(
  'play_history',
  {
    id: integer('id').primaryKey({
      autoIncrement: true,
    }),
    play_session_id: text('play_session_id'),
    media_source_id: text('media_source_id'),
    event_name: text('event_name'),
    position_ticks: text('position_ticks'),
    timestamp: integer('timestamp', {
      mode: 'timestamp',
    })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    // prettier-ignore
    t.index('play_history_play_session_id').on(table.play_session_id),
    t.index('play_history_media_source_id').on(table.media_source_id),
    t.index('play_history_timestamp').on(table.timestamp),
  ],
)
