import { defineConfig } from 'drizzle-kit'
export default defineConfig({
  out: './drizzle',
  schema: './server/db/schema/',
  dialect: 'sqlite',
  driver: 'd1-http',
})
