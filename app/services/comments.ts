import { z } from 'zod'
import { db } from '~/lib/db.server'

const addCommentPayloadSchema = z.object({
	comment: z.string().min(1),
	columnId: z.string(),
	userId: z.string(),
})

const editCommentPayloadSchema = z.object({
	commentId: z.string(),
	newText: z.string().min(1),
})

const deleteCommentPayloadSchema = z.object({
	commentId: z.string(),
})

type AddCommentPayload = z.infer<typeof addCommentPayloadSchema>
type EditCommentPayload = z.infer<typeof editCommentPayloadSchema>
type DeleteCommentPayload = z.infer<typeof deleteCommentPayloadSchema>

export const addComment = async (payload: AddCommentPayload) => {
	try {
		const parsedPayload = addCommentPayloadSchema.parse(payload)

		await db.comment.create({
			data: {
				text: parsedPayload.comment,
				categoryId: parsedPayload.columnId,
				userId: parsedPayload.userId,
			},
		})
	} catch (error) {
		throw error
	}
}

export const editComment = async (payload: EditCommentPayload) => {
	try {
		const parsedPayload = editCommentPayloadSchema.parse(payload)

		await db.comment.update({
			where: {
				id: parsedPayload.commentId,
			},
			data: {
				text: parsedPayload.newText,
			},
		})
	} catch (error) {
		throw error
	}
}

export const deleteComment = async (payload: DeleteCommentPayload) => {
	try {
		const parsedPayload = deleteCommentPayloadSchema.parse(payload)

		await db.comment.delete({
			where: {
				id: parsedPayload.commentId,
			},
		})
	} catch (error) {
		throw error
	}
}
