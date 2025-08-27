import { PrismaClient } from '@prisma-client/generated'

const globalForPrisma = globalThis as unknown as { db: PrismaClient }

export const db = globalForPrisma.db || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.db = db
}
