import { useFetcher } from 'react-router'
import { useState, useEffect, useRef } from 'react'
import { z } from 'zod'

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
						className="block w-full h-28 rounded-sm border border-slate-700 bg-white p-1 mb-2 font-sans"
						id="action"
						name="action"
						defaultValue={text}
					/>
					<label htmlFor="assignee">Assignee</label>
					<input
						className="block w-full md:w-80 rounded-sm border border-slate-700 bg-white p-1 mb-2 font-sans"
						id="assignee"
						name="assignee"
						defaultValue={assignee}
					/>
					<input type="hidden" name="id" value={id} />
					<div className="flex justify-end gap-2 pt-5">
						<button
							className="w-20 rounded border border-slate-800 px-2 py-1 text-slate-800 cursor-pointer"
							onClick={handleCancel}
							type="button">
							Cancel
						</button>
						<button
							className="w-20 border border-slate-800 rounded bg-slate-800 px-2 py-1 text-white cursor-pointer"
							name="_intent"
							value="edit">
							Save
						</button>
					</div>
				</fetcher.Form>
			</li>
		)
	}

	return (
		<li key={id} className="pb-4">
			<p className="relative pr-6">
				{text}
				<button
					aria-label={`Edit action item ${text}`}
					type="button"
					className="absolute top-0 right-0 cursor-pointer"
					onClick={handleEdit}>
					<EditIcon />
				</button>
			</p>
			<span className="text-sm">Assignee: {assignee}</span>
		</li>
	)
}
