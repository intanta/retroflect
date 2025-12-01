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

import { logError } from '~/utils/helpers'

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

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()

	const commentId = formData.get('commentId') as string
	const intent = formData.get('_intent') as string

	try {
		await db.comment.update({
			where: {
				id: commentId,
			},
			data: {
				votes:
					intent === 'upvote'
						? {
								increment: 1,
							}
						: {
								decrement: 1,
							},
			},
		})

		return { success: true, error: null }
	} catch (error) {
		logError(error, 'Vote action: ')
		return data(
			{ success: false, error: 'Error while updating votes for a comment' },
			{ status: 400 },
		)
	}
}

const votePropsSchema = z.object({
	loaderData: loaderDataSchema,
})
type VoteProps = z.infer<typeof votePropsSchema>

export default function Vote({ loaderData }: VoteProps) {
	const { columns } = loaderData

	const [upvotedComments, setUpvotedComments] = useState<string[]>([])
	const [votesLeft, setVotesLeft] = useState<number>(5) // TODO make it based on amount of comments
	const fetcher = useFetcher()

	const handleVote = (commentId: string) => {
		const isUpvoted = upvotedComments.includes(commentId)

		if (votesLeft === 0 && !isUpvoted) {
			return
		}

		const formData = new FormData()
		formData.append('commentId', commentId)

		if (isUpvoted) {
			setUpvotedComments((prevUpvotedComments) =>
				prevUpvotedComments.filter((id) => id !== commentId),
			)
			setVotesLeft((prevVotesLeft) => prevVotesLeft + 1)

			formData.append('_intent', 'downvote')
		} else {
			setUpvotedComments((prevUpvotedComments) => [
				...prevUpvotedComments,
				commentId,
			])
			setVotesLeft((prevVotesLeft) => prevVotesLeft - 1)

			formData.append('_intent', 'upvote')
		}

		fetcher.submit(formData, { method: 'post' })
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
								const isDisabled = !isUpvoted && votesLeft === 0

								return (
									<div
										className="bg-lime-200 p-2 font-sans mb-4 shadow-md"
										key={comment.id}
										id={comment.id}>
										{comment.text}
										<div className="text-right">
											<button
												aria-label="Vote for the comment"
												aria-describedby={comment.id}
												aria-pressed={isUpvoted ? true : false}
												className={`p-2 rounded-md ${isUpvoted ? 'bg-slate-800 text-white' : 'bg-transparent text-slate-500'} ${isDisabled ? 'cursor-default' : 'cursor-pointer'}`}
												onClick={() => handleVote(comment.id)}
												type="button">
												<ThumbsUpIcon />
											</button>
										</div>
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
