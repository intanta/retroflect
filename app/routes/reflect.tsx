import {
	type MetaFunction,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	data,
	useFetcher,
} from 'react-router'
import { useEffect, useState } from 'react'
import { z } from 'zod'

import { db } from '~/lib/db.server'
import { getSession } from '~/lib/session.server'

import { BoardColumn } from '~/components/BoardColumn'

import { addComment, deleteComment, editComment } from '~/services/comments'
import {
	type ColumnList,
	columnListSchema,
	commentsListSchema,
	columnStatusSchema,
} from '~/services/types'

import { logError } from '~/utils/helpers'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Retroflect - Fill out the board' },
		{ name: 'description', content: 'Fill out the retro board' },
	]
}

const loaderDataSchema = z.object({
	columns: columnListSchema,
	comments: commentsListSchema,
})

const actionDataSchema = z.object({
	success: z.boolean(),
	error: z.string().nullable(),
})

export async function loader({ request, params }: LoaderFunctionArgs) {
	const { id } = params

	try {
		const session = await getSession(request.headers.get('Cookie'))
		// TODO make sure we have userId, if not - create?

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
		logError(error, 'Reflect loader: ')

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

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()

	const intent = formData.get('_intent') as string

	try {
		const session = await getSession(request.headers.get('Cookie'))
		const userId = session.get('userId')!

		if (intent === 'delete') {
			// TODO maybe delete only if userId matches?
			const commentId = formData.get('commentId') as string

			await deleteComment({ commentId })

			return data({ success: true, error: null })
		}

		const comment = formData.get('comment') as string
		const columnId = formData.get('columnId') as string
		const commentId = formData.get('commentId') as string

		if ((intent === 'add' || intent === 'edit') && !comment) {
			return data(
				{ success: false, error: 'Cannot save an empty comment' },
				{ status: 400 },
			)
		}

		const commentToSave =
			comment.length > 450 ? `${comment.slice(0, 450)}...` : comment

		if (intent === 'add' && columnId) {
			await addComment({
				comment: commentToSave,
				columnId,
				userId,
			})

			return data({ success: true, error: null })
		}

		if (intent === 'edit' && commentId) {
			await editComment({
				commentId,
				newText: commentToSave,
			})

			return data({ success: true, error: null })
		}

		// TODO match intent through ts pattern

		console.log('unrecognized intent or no column/comment id')
		return data(
			{ success: false, error: 'Error while saving a comment' },
			{ status: 400 },
		)
	} catch (error) {
		logError(error, 'Reflect action: ')

		return data(
			{ success: false, error: 'Error in Reflect action' },
			{ status: 500 },
		)
	}
}

const boardPropsSchema = z.object({
	loaderData: loaderDataSchema,
	actionData: actionDataSchema,
})
type BoardProps = z.infer<typeof boardPropsSchema>

const columnStatusMapSchema = z.record(z.string(), columnStatusSchema)
type ColumnStatus = z.infer<typeof columnStatusMapSchema>

const mapColumnsToIdleStatus = (columns: ColumnList) => {
	if (columns.length === 0) {
		return {}
	}

	return columns.reduce((res, column) => {
		res[column.id] = 'idle'

		return res
	}, {} as ColumnStatus)
}

export default function Reflect({ loaderData }: BoardProps) {
	const { columns, comments } = loaderData

	const fetcher = useFetcher({ key: 'saveComment' })

	const [status, setStatus] = useState<ColumnStatus>(mapColumnsToIdleStatus(columns))

	useEffect(() => {
		console.log('useEffect on comments')
		if (fetcher.data?.success) {
			setStatus(mapColumnsToIdleStatus(columns))
		}
	}, [comments])

	const handleDiscard = () => {
		setStatus(mapColumnsToIdleStatus(columns))
	}

	const handleAdd = (columnId: string) => {
		const newColumnStatus = mapColumnsToIdleStatus(columns)

		setStatus({
			...newColumnStatus,
			[columnId]: 'adding',
		})
	}

	const handleEdit = (columnId: string) => {
		const newColumnStatus = mapColumnsToIdleStatus(columns)

		setStatus({
			...newColumnStatus,
			[columnId]: 'editing',
		})
	}

	return columns?.length ? (
		<div className="grid grid-cols-3 gap-4">
			{columns.map((column) => {
				return (
					<BoardColumn
						key={column.id}
						id={column.id}
						name={column.name}
						comments={comments?.filter(
							(comment) => comment.categoryId === column.id,
						)}
						onAdd={handleAdd}
						onDiscard={handleDiscard}
						onEdit={handleEdit}
						status={status[column.id]}
					/>
				)
			})}
		</div>
	) : null
}
