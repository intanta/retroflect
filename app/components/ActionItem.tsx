import { useFetcher } from 'react-router'
import { useState, useEffect, useRef } from 'react'
import { z } from 'zod'

import { Button } from './Button'
import { EditIcon } from './Icons/EditIcon'

const actionItemSchema = z.object({
	id: z.string(),
	text: z.string(),
	assignee: z.string().optional(),
})

const actionItemEntrySchema = z.object({
	data: actionItemSchema,
})
type ActionItemEntryProps = z.infer<typeof actionItemEntrySchema>

export function ActionItemEntry({ data }: ActionItemEntryProps) {
	const [isEditing, setIsEditing] = useState(false)

	const fetcher = useFetcher()

	const { id, text, assignee } = data

	useEffect(() => {
		// TODO what about fetcher state?
		// + showing error?
		if (fetcher.data?.success && isEditing) {
			setIsEditing(false)
		}
	}, [fetcher.data])

	const handleEdit = () => {
		setIsEditing(true)
	}

	const handleCancel = () => {
		setIsEditing(false)
	}

	const handleSave = (e: any) => {
		const formData = new FormData(e.currentTarget)
		const actionItem = formData.get('action') as string

		if (!actionItem) {
			e.preventDefault()
			return
		}
	}

	if (isEditing) {
		return (
			<li key={id} className="pb-4">
				<fetcher.Form method="post" className="" onSubmit={handleSave}>
					<label htmlFor="action">Action item</label>
					<textarea
						className="block w-full h-28 rounded-sm border border-line bg-surface p-1 mb-2 font-sans"
						id="action"
						name="action"
						defaultValue={text}
					/>
					<label htmlFor="assignee">Assignee</label>
					<input
						className="block w-full md:w-80 rounded-sm border border-line bg-surface p-1 mb-2 font-sans"
						id="assignee"
						name="assignee"
						defaultValue={assignee}
					/>
					<input type="hidden" name="id" value={id} />
					<div className="flex justify-end gap-2 pt-5">
						<Button variant="secondary" className="w-20" onClick={handleCancel}>
							Cancel
						</Button>
						<Button
							type="submit"
							variant="primary"
							className="w-20"
							name="_intent"
							value="edit">
							Save
						</Button>
					</div>
				</fetcher.Form>
			</li>
		)
	}

	return (
		<li key={id} className="pb-4">
			<p className="relative pr-6">
				{text}
				<Button
					aria-label={`Edit action item ${text}`}
					variant="secondary-ghost"
					className="absolute top-0 right-0 p-1 -m-1.5"
					onClick={handleEdit}>
					<EditIcon />
				</Button>
			</p>
			<span className="text-sm">Assignee: {assignee}</span>
		</li>
	)
}
