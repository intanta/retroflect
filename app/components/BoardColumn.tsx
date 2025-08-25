import { useState } from 'react'
import { z } from 'zod'

import { NewComment } from './NewComment'
import { CircledPlusIcon } from './Icons/CircledPlusIcon'

const boardColumnPropsSchema = z.object({
	id: z.string(),
	name: z.string(),
})
type BoardColumnProps = z.infer<typeof boardColumnPropsSchema>

export function BoardColumn({ id, name }: BoardColumnProps) {
	const [status, setStatus] = useState('idle')
	const [savedComments, setSavedComments] = useState<string[]>([])

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
		setSavedComments((prevSavedComments) => [...prevSavedComments, comment])
		setStatus('idle')
	}

	return (
		<div className="py-3">
			<div className="flex justify-center gap-2 bg-slate-800 py-3 mb-2">
				<h2 className="text-white">{name}</h2>
				<button
					aria-label={`Add new comment under ${name}`}
					className="cursor-pointer"
					type="button"
					onClick={handleAdd}>
					<CircledPlusIcon className="text-white" />
				</button>
			</div>

			{savedComments.map((comment, i) => {
				return (
					<div className="bg-amber-200 p-2 text-sm mb-2 shadow-md" key={i}>
						{comment}
					</div>
				)
			})}
			{status === 'adding' ? (
				<NewComment columnId={id} onSave={handleSave} onDiscard={handleDiscard} />
			) : null}
		</div>
	)
}
