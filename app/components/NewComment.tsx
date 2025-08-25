import { Form } from 'react-router'
import { useEffect, useRef } from 'react'
import { z } from 'zod'

import { CheckIcon } from './Icons/CheckIcon'
import { TrashIcon } from './Icons/TrashIcon'

const newColumnPropsSchema = z.object({
	columnId: z.string(),
	onDiscard: z.function(),
	onSave: z.function({
		input: [z.string()],
	}),
})
type NewColumnProps = z.infer<typeof newColumnPropsSchema>

export function NewComment({ columnId, onSave, onDiscard }: NewColumnProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const handleSave = (e: any) => {
		e.preventDefault()

		const formData = new FormData(e.currentTarget)
		const comment = formData.get('comment') as string

		onSave(comment)
	}

	useEffect(() => {
		if (textareaRef?.current) {
			textareaRef.current.focus()
		}
	}, [])

	return (
		<Form
			className="bg-amber-200 p-1"
			action="add-comment"
			method="post"
			onSubmit={handleSave}>
			<textarea
				aria-label="Comment"
				className="block w-full text-sm p-1"
				name="comment"
				ref={textareaRef}
			/>
			<input type="hidden" name="columnId" value={columnId} />
			<div className="flex justify-between pt-2">
				<button aria-label="Save" className="cursor-pointer">
					<CheckIcon className="fill-slate-800" />
				</button>
				<button
					aria-label="Discard"
					className="cursor-pointer"
					onClick={onDiscard}
					type="button">
					<TrashIcon className="text-slate-800" />
				</button>
			</div>
		</Form>
	)
}
