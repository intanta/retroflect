import {
	type MetaFunction,
	type LoaderFunctionArgs,
	data,
	useRouteError,
	redirect,
} from 'react-router'
import { useState } from 'react'
import { z } from 'zod'

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
	const { id } = params

	// TODO get retro status
	const retroStatus = 'reflect'

	console.log('retroStatus ', retroStatus)

	if (retroStatus === 'reflect') {
		throw data({
			message: 'Please wait, your retro board is not ready for voting yet.',
		})
	}

	if (retroStatus === 'review') {
		return redirect('review')
	}

	// get columns with comments by retro id

	console.log('Retro ID - ', id)

	return data({
		columns: [
			{
				id: '1',
				name: 'What went well',
				comments: [
					{ id: '11', text: 'comment 11' },
					{ id: '12', text: 'comment 12' },
				],
			},
			{
				id: '2',
				name: 'What went wrong',
				comments: [
					{ id: '21', text: 'comment 21' },
					{ id: '22', text: 'comment 22' },
					{ id: '23', text: 'comment 23' },
				],
			},
			{ id: '3', name: 'Gratitudes', comments: [{ id: '31', text: 'comment 31' }] },
		],
	})
}

const votePropsSchema = z.object({
	loaderData: loaderDataSchema,
})
type VoteProps = z.infer<typeof votePropsSchema>

export default function Vote({ loaderData }: VoteProps) {
	const { columns } = loaderData

	const [upvotedComments, setUpvotedComments] = useState<string[]>([])
	const [votesLeft, setVotesLeft] = useState<number>(5)

	const handleVote = (commentId: string) => {
		if (votesLeft === 0 || upvotedComments.includes(commentId)) {
			return
		}

		setUpvotedComments((prevUpvotedComments) => [...prevUpvotedComments, commentId])
		setVotesLeft((prevVotesLeft) => prevVotesLeft - 1)
	}

	return (
		<>
			<p>Votes left: {votesLeft}</p>
			{columns?.length ? (
				<div className="grid grid-cols-3 gap-4">
					{columns.map((column) => (
						<div key={column.id} className="flex flex-col">
							<div className="py-3 bg-slate-800 mb-2">
								<h2 className="text-center text-white">{column.name}</h2>
							</div>
							{column.comments.map((comment) => {
								const isUpvoted = upvotedComments.includes(comment.id)

								return (
									<div
										className="bg-amber-200 p-2 text-sm mb-2 shadow-md"
										key={comment.id}
										id={comment.id}>
										{comment.text}
										<div className="text-right">
											<button
												aria-label="Vote for the comment"
												aria-describedby={comment.id}
												className={
													isUpvoted || votesLeft === 0
														? 'cursor-default'
														: 'cursor-pointer'
												}
												onClick={() => handleVote(comment.id)}
												type="button">
												<ThumbsUpIcon
													className={isUpvoted ? 'text-slate-800' : 'text-slate-500'}
												/>
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
