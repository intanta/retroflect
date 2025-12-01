import { z } from 'zod'

const columnSchema = z.object({
	id: z.string(),
	name: z.string(),
})
export const columnListSchema = z.array(columnSchema)

const commentSchema = z.object({
	id: z.string(),
	text: z.string(),
	categoryId: z.string(),
})
export const commentsListSchema = z.array(commentSchema)

export const columnStatusSchema = z.union([
	z.literal('adding'),
	z.literal('editing'),
	z.literal('idle'),
])

export type Column = z.infer<typeof columnSchema>
export type ColumnList = z.infer<typeof columnListSchema>
export type Comment = z.infer<typeof commentSchema>
export type CommentList = z.infer<typeof commentsListSchema>
export type ColumnStatus = z.infer<typeof columnStatusSchema>
