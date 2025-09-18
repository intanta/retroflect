import { useFetcher } from 'react-router'
import { useEffect, useState } from 'react'
import { z } from 'zod'

import { NewComment } from './NewComment'
import { CircledPlusIcon } from './Icons/CircledPlusIcon'
import { TrashIcon } from './Icons/TrashIcon'

const boardColumnPropsSchema = z.object({
	id: z.string(),
	name: z.string(),
	comments: z.array(z.any()).optional(), // TODO fix type
})
type BoardColumnProps = z.infer<typeof boardColumnPropsSchema>

export function BoardColumn({ id, name, comments }: BoardColumnProps) {
	const fetcher = useFetcher()
	const [status, setStatus] = useState('idle')
	// const [savedComments, setSavedComments] = useState<string[]>([])

	useEffect(() => {
		setStatus('idle')
	}, [comments?.length])

	const handleAdd = () => {
		if (status === 'adding') {
			// TODO move focus to already opened comment
			return
		}

		setStatus('adding')
	}

	const handleDiscard = () => {
		setStatus('idle')
	}

	const handleSave = (comment: string) => {
		// setSavedComments((prevSavedComments) => [...prevSavedComments, comment])
		// setStatus('idle')
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
						return (
							<div
								className="bg-lime-200 p-2 font-sans mb-4 shadow-md"
								key={comment.id}>
								<p>{comment.text}</p>
								<fetcher.Form
									className="flex justify-end pt-2"
									action="delete-comment"
									method="post">
									<input type="hidden" name="comment-id" value={comment.id} />
									<button
										aria-label="Discard"
										className="cursor-pointer"
										type="submit">
										<TrashIcon className="text-slate-800" />
									</button>
								</fetcher.Form>
							</div>
						)
					})
				: null}
			{status === 'adding' ? (
				<NewComment columnId={id} onSave={handleSave} onDiscard={handleDiscard} />
			) : null}
		</div>
	)
}
