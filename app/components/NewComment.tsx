import { useFetcher } from 'react-router'
import { useEffect, useRef } from 'react'
import { z } from 'zod'

import { Button } from './Button'
import { SendIcon } from './Icons/SendIcon'
import { TrashIcon } from './Icons/TrashIcon'
import { EmojiPicker } from './EmojiPicker'

const newColumnPropsSchema = z.object({
	columnId: z.string(),
	commentId: z.string().optional(),
	currentText: z.string().optional(),
	onDiscard: z.function(),
	onSave: z.function({
		input: [z.string()],
	}),
})
type NewColumnProps = z.infer<typeof newColumnPropsSchema>

export function NewComment({
	columnId,
	commentId,
	currentText,
	onSave,
	onDiscard,
}: NewColumnProps) {
	const fetcher = useFetcher({ key: 'saveComment' })
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
		if (textareaRef.current) {
			textareaRef.current.value = textareaRef.current.value + emoji
			textareaRef.current.focus()
		}
	}

	return (
		<fetcher.Form
			className="bg-note p-6 pb-4 mb-4"
			method="post"
			onSubmit={handleSave}>
			<div className="relative">
				<textarea
					aria-label="Comment"
					className="block w-full h-32 border border-line rounded bg-surface font-sans p-1 pr-8"
					name="comment"
					ref={textareaRef}
					maxLength={450}
					defaultValue={currentText ?? ''}
				/>
				<EmojiPicker className="bottom-1 right-2" onPick={handlePickEmoji} />
			</div>
			<input type="hidden" name="columnId" value={columnId} />
			{commentId ? <input type="hidden" name="commentId" value={commentId} /> : null}
			<div className="flex justify-between pt-6">
				<Button variant="secondary" className="p-2 text-sm" onClick={onDiscard}>
					Cancel
				</Button>
				<Button
					aria-label="Save"
					type="submit"
					variant="primary"
					className="p-2"
					name="_intent"
					value={currentText ? 'edit' : 'add'}>
					<SendIcon className="size-5" />
				</Button>
			</div>
		</fetcher.Form>
	)
}
