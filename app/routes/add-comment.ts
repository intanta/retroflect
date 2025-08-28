import { type ActionFunctionArgs } from 'react-router'
import { z } from 'zod'

import { db } from '~/lib/db.server'

const actionDataSchema = z.object({
	success: z.boolean(),
	error: z.string().nullable(),
})
type ActionData = z.infer<typeof actionDataSchema>

export async function action({ request }: ActionFunctionArgs): Promise<ActionData> {
	console.log('add-comment action')
	const formData = await request.formData()

	const comment = formData.get('comment') as string
	const columnId = formData.get('columnId') as string

	try {
		await db.comment.create({
			data: {
				text: comment,
				categoryId: columnId,
			},
		})

		return { success: true, error: null }
	} catch (error) {
		console.log(error)
		return { success: false, error: 'Error while saving a comment' }
	}
}
