import { z } from 'zod'
import { db } from '~/lib/db.server'

// const addCommentPayloadSchema = z.object({
//   comment: z.string().min(1),
//   columnId: z.string(),
//   userId: z.string(),
// })

// const editCommentPayloadSchema = z.object({
//   commentId: z.string(),
//   newText: z.string().min(1),
// })

// const deleteCommentPayloadSchema = z.object({
//   commentId: z.string(),
// })

// type AddCommentPayload = z.infer<typeof addCommentPayloadSchema>
// type EditCommentPayload = z.infer<typeof editCommentPayloadSchema>
// type DeleteCommentPayload = z.infer<typeof deleteCommentPayloadSchema>

// export const addComment = async (payload: AddCommentPayload) => {
//   try {
//     const parsedPayload = addCommentPayloadSchema.parse(payload)

//     await db.comment.create({
//       data: {
//         text: parsedPayload.comment,
//         categoryId: parsedPayload.columnId,
//         userId: parsedPayload.userId,
//       },
//     })
//   } catch (error) {
//     throw error
//   }
// }

// export const editComment = async (payload: EditCommentPayload) => {
//   try {
//     const parsedPayload = editCommentPayloadSchema.parse(payload)

//     await db.comment.update({
//       where: {
//         id: parsedPayload.commentId,
//       },
//       data: {
//         text: parsedPayload.newText,
//       },
//     })
//   } catch (error) {
//     throw error
//   }
// }

// export const deleteComment = async (payload: DeleteCommentPayload) => {
//   try {
//     const parsedPayload = deleteCommentPayloadSchema.parse(payload)

//     await db.comment.delete({
//       where: {
//         id: parsedPayload.commentId,
//       },
//     })
//   } catch (error) {
//     throw error
//   }
// }

// TODO - sorting should come in params
export const getActionItems = async (sort: string, direction: string) => {
	try {
		return await db.action.findMany({
			orderBy: [
				{
					createdAt: 'desc',
				},
			],
			select: {
				id: true,
				text: true,
				assignee: true,
				createdAt: true,
				status: true,
			},
		})
	} catch (error) {
		throw error
	}
}

type ActionItemStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'NOT_NEEDED'

export const updateActionItemStatus = async (
	id: string,
	status: ActionItemStatus,
) => {
	try {
		await db.action.update({
			where: {
				id: id,
			},
			data: {
				status: status,
			},
		})
	} catch (error) {
		throw error
	}
}
