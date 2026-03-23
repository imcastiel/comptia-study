import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

const DATABASE_URL = process.env.DATABASE_URL ?? 'file:./comptia.db'

const client = createClient({ url: DATABASE_URL })

export const db = drizzle(client, { schema })
export type DB = typeof db
