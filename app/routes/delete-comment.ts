import { type ActionFunctionArgs } from 'react-router'
import { z } from 'zod'

import { db } from '~/lib/db.server'

const actionDataSchema = z.object({
	success: z.boolean(),
	error: z.string().nullable(),
})
type ActionData = z.infer<typeof actionDataSchema>

export async function action({ request }: ActionFunctionArgs): Promise<ActionData> {
	const formData = await request.formData()

	const commentId = formData.get('comment-id') as string

	try {
		await db.comment.delete({
			where: {
				id: commentId,
			},
		})

		return { success: true, error: null }
	} catch (error) {
		if (error instanceof Error) {
			console.log('delete comment: ', error.message)
		}
		return { success: false, error: 'Error while deleting a comment' }
	}
}
