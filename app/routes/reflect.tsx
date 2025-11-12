import { type MetaFunction, type LoaderFunctionArgs, data } from 'react-router'
import { z } from 'zod'

import { db } from '~/lib/db.server'
import { getSession } from '~/lib/session.server'

import { BoardColumn } from '~/components/BoardColumn'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Retroflect - Fill out the board' },
		{ name: 'description', content: 'Fill out the retro board' },
	]
}

const columnSchema = z.object({
	id: z.string(),
	name: z.string(),
})
const columnListSchema = z.array(columnSchema)

const commentSchema = z.object({
	id: z.string(),
	text: z.string(),
	categoryId: z.string(),
})
const commentsListSchema = z.array(commentSchema)

const loaderDataSchema = z.object({
	columns: columnListSchema,
	comments: commentsListSchema,
})

export async function loader({ request, params }: LoaderFunctionArgs) {
	const { id } = params

	try {
		const session = await getSession(request.headers.get('Cookie'))

		const columns = await db.category.findMany({
			where: {
				retroId: id,
			},
		})
		const comments = await db.comment.findMany({
			where: {
				userId: session.get('userId'),
			},
			orderBy: [
				{
					createdAt: 'asc',
				},
			],
		})

		return data({ columns, comments })
	} catch (error) {
		if (error instanceof Error) {
			console.log('reflect: ', error.message)
		}
		// TODO create an error boundary
		return data({
			columns: [
				{ id: '1', name: 'Something' },
				{ id: '2', name: 'Went' },
				{ id: '3', name: 'Wrong' },
			],
		})
	}
}

const boardPropsSchema = z.object({
	loaderData: loaderDataSchema,
})
type BoardProps = z.infer<typeof boardPropsSchema>

export default function Reflect({ loaderData }: BoardProps) {
	const { columns, comments } = loaderData

	return columns?.length ? (
		<div className="grid grid-cols-3 gap-4">
			{columns.map((column) => (
				<BoardColumn
					key={column.id}
					id={column.id}
					name={column.name}
					comments={comments?.filter((comment) => comment.categoryId === column.id)}
				/>
			))}
		</div>
	) : null
}
