import { useEffect, useState, useRef } from 'react'
import { z } from 'zod'

import { FaceIcon } from './Icons/FaceIcon'

const categorySchema = z.union([z.literal('faces'), z.literal('symbols')])
type Category = z.infer<typeof categorySchema>

const emojiSchema = z.object({
	unicode: z.string(),
	label: z.string(),
})
const emojiListSchema = z.record(categorySchema, z.array(emojiSchema))
type EmojiList = z.infer<typeof emojiListSchema>

const emojiList: EmojiList = {
	faces: [
		{
			unicode: '\u{1F601}',
			label: 'beaming face with smiling eyes',
		},
		{
			unicode: '\u{1F929}',
			label: 'star struck',
		},
		{
			unicode: '\u{1F92A}',
			label: 'zany face',
		},
		{
			unicode: '\u{1F644}',
			label: 'face with rolling eyes',
		},
		{
			unicode: '\u{1FAE0}',
			label: 'melting face',
		},
		{
			unicode: '\u{1F92F}',
			label: 'exploding head',
		},
		{
			unicode: '\u{1F62D}',
			label: 'loudly crying face',
		},
		{
			unicode: '\u{1F620}',
			label: 'angry face',
		},
	],
	symbols: [
		{
			unicode: '\u{2764}\u{FE0F}',
			label: 'red heart',
		},
		{
			unicode: '\u{1F49C}',
			label: 'purple heart',
		},
		{
			unicode: '\u{1F44F}',
			label: 'clapping hands',
		},
		{
			unicode: '\u{2B50}',
			label: 'star',
		},
		{
			unicode: '\u{1F525}',
			label: 'fire',
		},
		{
			unicode: '\u{1F389}',
			label: 'party popper',
		},
		{
			unicode: '\u{1F680}',
			label: 'rocket',
		},
	],
}

const emojiPickerPropsSchema = z.object({
	className: z.string().optional(),
	onPick: z.function({ input: [z.string()] }),
})
type EmojiPickerProps = z.infer<typeof emojiPickerPropsSchema>

export function EmojiPicker({ className, onPick }: EmojiPickerProps) {
	const [isOpen, setIsOpen] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)

	const categories = Object.keys(emojiList) as Category[]

	useEffect(() => {
		if (isOpen) {
			const controller = new AbortController()
			const signal = controller.signal

			// TODO fix type of event
			const handleClickOutside = (e) => {
				if (containerRef.current && !containerRef.current.contains(e.target)) {
					setIsOpen(false)
					controller.abort()
				}
			}

			document.addEventListener('click', handleClickOutside, {
				signal,
			})

			return () => {
				if (!signal.aborted) {
					controller.abort()
				}
			}
		}
	}, [isOpen])

	const handleTriggerClick = () => {
		setIsOpen((prevIsOpen) => !prevIsOpen)
	}

	const handlePick = (e: React.MouseEvent<HTMLButtonElement>) => {
		const emoji = (e.target as HTMLElement).innerText

		onPick(emoji)
		setIsOpen(false)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		// TODO whats up with Escape in safari?
		if (e.key === 'Escape' && isOpen) {
			setIsOpen(false)
		}
	}

	return (
		<div
			className={`inline-block absolute ${className}`}
			onKeyDown={handleKeyDown}
			ref={containerRef}>
			<button
				aria-label="emoji picker"
				className="cursor-pointer"
				onClick={handleTriggerClick}
				type="button">
				<FaceIcon className="fill-slate-500" />
			</button>
			<div
				className={`${isOpen ? 'block' : 'hidden'} absolute top-6 right-0 w-[178px] p-2 bg-white border border-slate-900`}>
				{categories.map((category) => {
					return (
						<div key={category}>
							{emojiList[category].map((emoji, i) => {
								return (
									<button
										aria-label={emoji.label}
										className="px-2 py-1 text-2xl cursor-pointer"
										key={i}
										onClick={handlePick}
										type="button">
										{emoji.unicode}
									</button>
								)
							})}
						</div>
					)
				})}
			</div>
		</div>
	)
}
