import { type MetaFunction, type LoaderFunctionArgs, data } from 'react-router'
import { z } from 'zod'

import { db } from '~/lib/db.server'

import { ThumbsUpIcon } from '~/components/Icons/ThumbsUpIcon'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Retroflect - Review' },
		{ name: 'description', content: 'Discussing retro comments' },
	]
}

const commentSchema = z.object({
	id: z.string(),
	text: z.string(),
	votes: z.number(),
})
const commentListSchema = z.array(commentSchema)

const loaderDataSchema = z.object({
	comments: commentListSchema,
})

export async function loader({ params }: LoaderFunctionArgs) {
	const { id } = params

	try {
		const columns = await db.category.findMany({
			where: {
				retroId: id,
			},
			select: {
				id: true,
			},
		})
		const columnsIds = columns.map((column) => column.id)

		// TODO include column name
		const comments = await db.comment.findMany({
			where: {
				categoryId: { in: columnsIds },
			},
			orderBy: [
				{
					votes: 'desc',
				},
			],
		})
		return data({ comments })
	} catch (error) {
		console.log(error)
		// TODO create an error boundary
		return data({
			comments: [],
		})
	}
}

const reviewPropsSchema = z.object({
	loaderData: loaderDataSchema,
})
type ReviewProps = z.infer<typeof reviewPropsSchema>

export default function Review({ loaderData }: ReviewProps) {
	const { comments } = loaderData

	return comments?.length ? (
		<div className="grid grid-cols-3 gap-4 pt-5">
			{comments.map((comment) => (
				<div
					className="bg-amber-200 p-2 text-sm mb-2 shadow-md"
					key={comment.id}
					id={comment.id}>
					{comment.text}
					<div className="flex justify-end items-center gap-1">
						<ThumbsUpIcon className="inline-block text-slate-800" />
						<span>{comment.votes}</span>
					</div>
				</div>
			))}
		</div>
	) : (
		<p>Oh no, nothing to discuss</p>
	)
}
