import {
	type MetaFunction,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	data,
	useFetcher,
	useRouteError,
} from 'react-router'
import { useState, useRef } from 'react'
import { z } from 'zod'

import { db } from '~/lib/db.server'

import { HourGlassIcon } from '~/components/Icons/HourGlassIcon'
import { ThumbsUpIcon } from '~/components/Icons/ThumbsUpIcon'
import { ChevronIcon } from '~/components/Icons/ChevronIcon'

import { isHostCookie } from '~/utils/cookie'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Retroflect - Review' },
		{ name: 'description', content: 'Discussing retro comments' },
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

	console.log(error)

	return <p>Oops, something went horribly wrong</p>
}

const commentSchema = z.object({
	id: z.string(),
	text: z.string(),
	votes: z.number(),
	category: z.object({
		name: z.string(),
	}),
})
const commentListSchema = z.array(commentSchema)
const actionItemSchema = z.object({
	text: z.string(),
	assignee: z.string(),
})
const actionItemListSchema = z.array(actionItemSchema)

type ActionItemList = z.infer<typeof actionItemListSchema>

const loaderDataSchema = z.object({
	comments: commentListSchema,
	isHost: z.boolean(),
})

export async function loader({ params, request }: LoaderFunctionArgs) {
	const { id } = params

	try {
		const retro = await db.retro.findUnique({
			where: {
				id,
			},
			select: {
				status: true,
			},
		})

		console.log('Review route - retroStatus ', retro?.status)

		if (retro?.status !== 'REVIEW') {
			throw data({
				message: 'Please wait, your retro board is not ready for review yet.',
			})
		}

		const columns = await db.category.findMany({
			where: {
				retroId: id,
			},
			select: {
				id: true,
			},
		})
		const columnsIds = columns.map((column) => column.id)

		const comments = await db.comment.findMany({
			where: {
				categoryId: { in: columnsIds },
			},
			include: {
				category: {
					select: {
						name: true,
					},
				},
			},
			orderBy: [
				{
					votes: 'desc',
				},
			],
		})

		const cookieHeader = request.headers.get('Cookie')
		const cookie = (await isHostCookie.parse(cookieHeader)) || null

		return data({ isHost: Boolean(cookie), comments })
	} catch (error) {
		console.log(error)
		// TODO create an error boundary
		return data({
			comments: [],
		})
	}
}

export async function action({ params, request }: ActionFunctionArgs) {
	console.log('review action')

	if (!params.id) {
		return null
	}

	const formData = await request.formData()
	const text = formData.get('action') as string
	const assignee = formData.get('assignee') as string

	// TODO add validation

	try {
		await db.action.create({
			data: {
				retroId: params.id,
				text,
				assignee,
			},
		})

		return { success: true, error: null }
	} catch (error) {
		console.log(error)
		return { success: false, error: 'Error while adding an action item' }
	}
}

const reviewPropsSchema = z.object({
	loaderData: loaderDataSchema,
})
type ReviewProps = z.infer<typeof reviewPropsSchema>

export default function Review({ loaderData }: ReviewProps) {
	const { comments, isHost } = loaderData
	console.log(comments)

	const fetcher = useFetcher()
	const actionPopoverRef = useRef(null)

	const [current, setCurrent] = useState(0)
	const [actionItems, setActionItems] = useState<ActionItemList>([])

	if (!comments?.length) {
		return (
			<div className="absolute h-screen top-0 left-0 right-0 flex flex-col justify-center items-center gap-5 bg-slate-800">
				<p className="text-white text-3xl">
					Oh no! Looks like there is nothing to review
				</p>
			</div>
		)
	}

	const handleNext = () => {
		if (current === comments.length - 1) {
			return
		}

		setCurrent((prevCurrent) => prevCurrent + 1)
	}

	const handlePrev = () => {
		if (current === 0) {
			return
		}

		setCurrent((prevCurrent) => prevCurrent - 1)
	}

	const hideActionPopover = () => {
		// TODO reset form via ref
		if (actionPopoverRef.current) {
			const el = actionPopoverRef.current as HTMLElement
			el.hidePopover()
		}
	}

	const handleSave = (e: any) => {
		const formData = new FormData(e.currentTarget)
		const actionItem = formData.get('action') as string
		const assignee = formData.get('assignee') as string

		if (!actionItem) {
			e.preventDefault()
			return
		}

		setActionItems((prevActionItems) => [
			...prevActionItems,
			{ text: actionItem, assignee },
		])

		hideActionPopover()
		e.currentTarget.reset()
	}

	const isPrevDisabled = current === 0
	const isNextDisabled = current === comments.length - 1
	const hasActionItems = actionItems.length > 0

	return (
		<>
			{isHost ? (
				<p className="py-4">
					Action items: {actionItems.length}{' '}
					{hasActionItems ? (
						<button
							className="px-2 cursor-pointer border-2 rounded border-slate-800 text-slate-800"
							type="button"
							popoverTarget="view-actions-popover">
							View
						</button>
					) : null}
				</p>
			) : null}
			<div
				className="m-auto shadow-xl w-[500px] p-5"
				popover="auto"
				id="view-actions-popover">
				<h2 className="text-lg font-bold pb-3">Action items</h2>
				<ol className="list-decimal ml-8">
					{actionItems.map((actionItem, i) => {
						return (
							<li key={i} className="pb-4">
								<span>{actionItem.text}</span>
								<br />
								<span className="text-sm">Assignee: {actionItem.assignee}</span>
							</li>
						)
					})}
				</ol>
			</div>
			<div className="md:mx-auto pt-10">
				<div className="w-full md:w-96 h-56">
					{comments.map((comment, i) => {
						return (
							<div
								className={`w-full h-full bg-lime-200 p-2 font-sans mb-2 shadow-md ${current === i ? 'block' : 'hidden'}`}
								key={i}>
								<div className="flex justify-between pb-5">
									<span className="inline-block mb-2 py-1.5 px-2 rounded text-sm text-right text-slate-700 border border-slate-700">
										{comment.category.name}
									</span>
									<div className="flex justify-end items-center gap-1">
										<ThumbsUpIcon className="inline-block text-slate-800" />
										<span>{comment.votes}</span>
									</div>
								</div>
								{comment.text}
							</div>
						)
					})}
				</div>
				<div className="w-full flex justify-between pt-5">
					<div>
						<button
							aria-disabled={isPrevDisabled}
							aria-label="Previous"
							disabled={isPrevDisabled}
							type="button"
							className={`mr-2 cursor-pointer border-2 rounded ${isPrevDisabled ? 'border-slate-400 text-slate-400' : 'border-slate-800 text-slate-800'}`}
							onClick={handlePrev}>
							<ChevronIcon className="w-10 h-10" />
						</button>
						<button
							aria-disabled={isNextDisabled}
							aria-label="Next"
							disabled={isNextDisabled}
							type="button"
							className={`cursor-pointer border-2 rounded ${isNextDisabled ? 'border-slate-400 text-slate-400' : 'border-slate-800 text-slate-800'}`}
							onClick={handleNext}>
							<ChevronIcon className="w-10 h-10 rotate-180" />
						</button>
					</div>
					{isHost ? (
						<>
							<button
								className="h-11 rounded bg-slate-800 px-2 py-1 text-white cursor-pointer"
								type="button"
								popoverTarget="add-action-popover">
								Add action item
							</button>
							<div
								className="m-auto shadow-xl"
								popover="auto"
								id="add-action-popover"
								ref={actionPopoverRef}>
								<fetcher.Form
									method="post"
									className="w-[500px] p-5"
									onSubmit={handleSave}>
									{/* <input type="hidden" name="retroId" value={retroId} /> */}
									<label htmlFor="action">Action item</label>
									<textarea
										className="block w-80 rounded-sm border border-slate-700 bg-white p-1 mb-2 font-sans"
										id="action"
										name="action"
									/>
									<label htmlFor="assignee">Assignee</label>
									<input
										className="block w-80 rounded-sm border border-slate-700 bg-white p-1 mb-2 font-sans"
										id="assignee"
										name="assignee"
									/>
									<div className="flex justify-end gap-2 pt-5">
										<button
											className="w-20 rounded border border-slate-800 px-2 py-1 text-slate-800 cursor-pointer"
											onClick={hideActionPopover}
											type="button">
											Cancel
										</button>
										<button className="w-20 border border-slate-800 rounded bg-slate-800 px-2 py-1 text-white cursor-pointer">
											Save
										</button>
									</div>
								</fetcher.Form>
							</div>
						</>
					) : null}
				</div>
			</div>
		</>
	)
}
