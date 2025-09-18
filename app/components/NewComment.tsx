import { useFetcher } from 'react-router'
import { useEffect, useRef } from 'react'
import { z } from 'zod'

import { CheckIcon } from './Icons/CheckIcon'
import { TrashIcon } from './Icons/TrashIcon'
import { EmojiPicker } from './EmojiPicker'

const newColumnPropsSchema = z.object({
	columnId: z.string(),
	onDiscard: z.function(),
	onSave: z.function({
		input: [z.string()],
	}),
})
type NewColumnProps = z.infer<typeof newColumnPropsSchema>

export function NewComment({ columnId, onSave, onDiscard }: NewColumnProps) {
	const fetcher = useFetcher()
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const handleSave = (e: any) => {
		const formData = new FormData(e.currentTarget)
		const comment = formData.get('comment') as string

		if (!comment) {
			e.preventDefault()
			return
		}

		onSave(comment)
	}

	useEffect(() => {
		if (textareaRef?.current) {
			textareaRef.current.focus()
		}
	}, [])

	const handlePickEmoji = (emoji: string) => {
		console.log('emoji picked')
		if (textareaRef.current) {
			textareaRef.current.value = textareaRef.current.value + emoji
			textareaRef.current.focus()
		}
	}

	return (
		<fetcher.Form
			className="bg-lime-200 p-1"
			action="add-comment"
			method="post"
			onSubmit={handleSave}>
			<div className="relative">
				<textarea
					aria-label="Comment"
					className="block w-full h-20 border border-slate-600 rounded font-sans p-1 pr-8"
					name="comment"
					ref={textareaRef}
					maxLength={450}
				/>
				<EmojiPicker className="bottom-1 right-2" onPick={handlePickEmoji} />
			</div>
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
		</fetcher.Form>
	)
}
