import { useFetcher } from 'react-router'
import { useEffect, useState } from 'react'
import { z } from 'zod'

import { Button } from './Button'
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
			<div className="flex justify-between items-center gap-2 py-3">
				<h2 className="font-semibold">{name}</h2>
				<Button
					aria-label={`Add new comment under ${name}`}
					variant="ghost"
					onClick={handleAdd}>
					<CircledPlusIcon className="mr-2" /> Add
				</Button>
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
								className="bg-note p-6 pb-4 rounded-xl mb-4 shadow-md"
								key={comment.id}>
								<p className="pb-6 wrap-break-word">{comment.text}</p>
								<div className="flex justify-between">
									<Button
										aria-label="Edit comment"
										variant="secondary-ghost"
										className="-ml-2"
										onClick={() => handleEdit(comment.id)}>
										<EditIcon />
									</Button>
									<fetcher.Form method="post">
										<input type="hidden" name="commentId" value={comment.id} />
										<Button
											aria-label="Delete comment"
											variant="danger"
											className="p-2"
											name="_intent"
											value="delete"
											type="submit">
											<TrashIcon className="size-5" />
										</Button>
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
