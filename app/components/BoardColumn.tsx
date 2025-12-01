import { useFetcher } from 'react-router'
import { useEffect, useState } from 'react'
import { z } from 'zod'

import { NewComment } from './NewComment'
import { CircledPlusIcon } from './Icons/CircledPlusIcon'
import { EditIcon } from './Icons/EditIcon'
import { TrashIcon } from './Icons/TrashIcon'

import { columnStatusSchema, commentsListSchema } from '~/services/types'

const boardColumnPropsSchema = z.object({
	id: z.string(),
	name: z.string(),
	comments: commentsListSchema.optional(),
	onAdd: z.function({
		input: [z.string()],
	}),
	onDiscard: z.function(),
	onEdit: z.function({
		input: [z.string()],
	}),
	status: columnStatusSchema,
})
type BoardColumnProps = z.infer<typeof boardColumnPropsSchema>

export function BoardColumn({
	id,
	name,
	comments,
	status,
	onAdd,
	onDiscard,
	onEdit,
}: BoardColumnProps) {
	const fetcher = useFetcher({ key: 'deleteComment' })

	const [commentToEdit, setCommentToEdit] = useState<string | null>(null)

	useEffect(() => {
		if (status === 'idle' && commentToEdit) {
			setCommentToEdit(null)
		}
	}, [status])

	const handleAdd = () => {
		if (status === 'adding') {
			// TODO move focus to already opened comment
			return
		}

		if (typeof onAdd === 'function') {
			onAdd(id)
		}
	}

	const handleDiscard = () => {
		if (commentToEdit) {
			setCommentToEdit(null)
		}

		if (typeof onDiscard === 'function') {
			onDiscard()
		}
	}

	const handleEdit = (commentId: string) => {
		setCommentToEdit(commentId)

		if (typeof onEdit === 'function') {
			onEdit(id)
		}
	}

	return (
		<div className="py-3">
			<div className="flex justify-center gap-2 bg-slate-800 py-3 mb-4">
				<h2 className="text-white">{name}</h2>
				<button
					aria-label={`Add new comment under ${name}`}
					className="cursor-pointer"
					type="button"
					onClick={handleAdd}>
					<CircledPlusIcon className="text-white" />
				</button>
			</div>

			{comments
				? comments.map((comment) => {
						if (status === 'editing' && comment.id === commentToEdit) {
							return (
								<NewComment
									key={comment.id}
									columnId={id}
									commentId={comment.id}
									currentText={comment.text}
									onSave={() => {}}
									onDiscard={handleDiscard}
								/>
							)
						}
						return (
							<div
								className="bg-lime-200 p-6 pb-4 font-sans mb-4 shadow-md"
								key={comment.id}>
								<p className="pb-6 wrap-break-word">{comment.text}</p>
								<div className="flex justify-between">
									<button
										aria-label="Edit comment"
										className="cursor-pointer"
										type="button"
										onClick={() => handleEdit(comment.id)}>
										<EditIcon className="text-slate-800" />
									</button>
									<fetcher.Form method="post">
										<input type="hidden" name="commentId" value={comment.id} />
										<button
											aria-label="Delete comment"
											className="p-2 rounded-md bg-[#D82F65CC] cursor-pointer"
											name="_intent"
											value="delete"
											type="submit">
											<TrashIcon className="size-5 text-white" />
										</button>
									</fetcher.Form>
								</div>
							</div>
						)
					})
				: null}
			{status === 'adding' ? (
				<NewComment columnId={id} onSave={() => {}} onDiscard={handleDiscard} />
			) : null}
		</div>
	)
}
