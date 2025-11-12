import { type ActionFunctionArgs } from 'react-router'
import { z } from 'zod'

import { db } from '~/lib/db.server'
import { getSession } from '~/lib/session.server'

const actionDataSchema = z.object({
	success: z.boolean(),
	error: z.string().nullable(),
})
type ActionData = z.infer<typeof actionDataSchema>

export async function action({ request }: ActionFunctionArgs): Promise<ActionData> {
	const formData = await request.formData()

	const comment = formData.get('comment') as string
	const columnId = formData.get('columnId') as string

	try {
		const session = await getSession(request.headers.get('Cookie'))

		await db.comment.create({
			data: {
				text: comment,
				categoryId: columnId,
				userId: session.get('userId'),
			},
		})

		return { success: true, error: null }
	} catch (error) {
		if (error instanceof Error) {
			console.log('add comment: ', error.message)
		}
		return { success: false, error: 'Error while saving a comment' }
	}
}
