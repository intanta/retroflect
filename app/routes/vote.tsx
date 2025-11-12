import {
	type MetaFunction,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	data,
	useFetcher,
	useRouteError,
	redirect,
} from 'react-router'
import { useState, useMemo } from 'react'
import { z } from 'zod'

import { db } from '~/lib/db.server'

import { ThumbsUpIcon } from '~/components/Icons/ThumbsUpIcon'
import { HourGlassIcon } from '~/components/Icons/HourGlassIcon'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Retroflect - Voting' },
		{ name: 'description', content: 'Voting on retro comments' },
	]
}

const errorDataSchema = z.object({
	data: z.object({
		message: z.string(),
	}),
})
type ErrorData = z.infer<typeof errorDataSchema>

function isErrorData(err: unknown): err is ErrorData {
	return errorDataSchema.safeParse(err).success
}

export function ErrorBoundary() {
	const error = useRouteError()

	if (isErrorData(error)) {
		return (
			<div className="absolute h-screen top-0 left-0 right-0 flex flex-col justify-center items-center gap-5 bg-slate-800">
				<HourGlassIcon className="w-30 h-30 text-white" />
				<p className="text-white text-3xl">{error.data.message}</p>
			</div>
		)
	}

	return <p>Oops, something went horribly wrong</p>
}

const columnSchema = z.object({
	id: z.string(),
	name: z.string(),
	comments: z.array(
		z.object({
			id: z.string(),
			text: z.string(),
		}),
	),
})
const columnListSchema = z.array(columnSchema)

const loaderDataSchema = z.object({
	columns: columnListSchema,
})

export async function loader({ params }: LoaderFunctionArgs) {
	// TODO error handling
	const { id } = params

	const retro = await db.retro.findUnique({
		where: {
			id,
		},
		select: {
			status: true,
		},
	})

	if (retro?.status === 'REFLECT') {
		throw data({
			message: 'Please wait, your retro board is not ready for voting yet.',
		})
	}

	if (retro?.status === 'REVIEW') {
		return redirect(`/board/${id}/review`)
	}

	const columns = await db.category.findMany({
		where: {
			retroId: id,
		},
		include: {
			comments: true,
		},
	})

	return data({
		columns,
	})
}

const actionDataSchema = z.object({
	success: z.boolean(),
	error: z.string().nullable(),
})
type ActionData = z.infer<typeof actionDataSchema>

export async function action({ request }: ActionFunctionArgs): Promise<ActionData> {
	const formData = await request.formData()

	const commentId = formData.get('commentId') as string

	try {
		await db.comment.update({
			where: {
				id: commentId,
			},
			data: {
				votes: {
					increment: 1,
				},
			},
		})

		return { success: true, error: null }
	} catch (error) {
		if (error instanceof Error) {
			console.log('vote: ', error.message)
		}
		return { success: false, error: 'Error while updating votes for a comment' }
	}
}

const votePropsSchema = z.object({
	loaderData: loaderDataSchema,
})
type VoteProps = z.infer<typeof votePropsSchema>

export default function Vote({ loaderData }: VoteProps) {
	const { columns } = loaderData

	const [upvotedComments, setUpvotedComments] = useState<string[]>([])
	const [votesLeft, setVotesLeft] = useState<number>(5)
	const fetcher = useFetcher()

	const handleVote = (e: any, commentId: string) => {
		if (votesLeft === 0 || upvotedComments.includes(commentId)) {
			e.preventDefault()
			return
		}

		setUpvotedComments((prevUpvotedComments) => [...prevUpvotedComments, commentId])
		setVotesLeft((prevVotesLeft) => prevVotesLeft - 1)
	}

	// TODO maybe return comments ordered by createdAt, because when we vote the order of cards changes
	// memoizing for now as a hack
	const columnsToRender = useMemo(() => columns, [])

	return (
		<>
			<p className="py-2">Votes left: {votesLeft}</p>
			{columnsToRender?.length ? (
				<div className="grid grid-cols-3 gap-4">
					{columnsToRender.map((column) => (
						<div key={column.id} className="flex flex-col">
							<div className="py-3 bg-slate-800 mb-4">
								<h2 className="text-center text-white">{column.name}</h2>
							</div>
							{column.comments.map((comment) => {
								const isUpvoted = upvotedComments.includes(comment.id)

								return (
									<div
										className="bg-lime-200 p-2 font-sans mb-4 shadow-md"
										key={comment.id}
										id={comment.id}>
										{comment.text}
										<fetcher.Form method="post" className="text-right">
											<input type="hidden" name="commentId" value={comment.id} />
											<button
												aria-label="Vote for the comment"
												aria-describedby={comment.id}
												className={
													isUpvoted || votesLeft === 0
														? 'cursor-default'
														: 'cursor-pointer'
												}
												onClick={(e) => handleVote(e, comment.id)}>
												<ThumbsUpIcon
													className={isUpvoted ? 'text-slate-800' : 'text-slate-400'}
												/>
											</button>
										</fetcher.Form>
									</div>
								)
							})}
						</div>
					))}
				</div>
			) : null}
		</>
	)
}
