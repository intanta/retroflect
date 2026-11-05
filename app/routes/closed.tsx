import { type MetaFunction } from 'react-router'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Retroflect - Thank you' },
		{ name: 'description', content: 'Retro is now closed' },
	]
}

export default function ClosedRetro() {
	return (
		<div className="absolute h-screen top-0 left-0 right-0 flex flex-col justify-center items-center gap-5 bg-surface-inverse">
			<h1 className="text-ink-inverse text-3xl">Thank you!</h1>
			<p className="text-ink-inverse text-2xl">
				Your retro is now closed. See you next time! 👋
			</p>
		</div>
	)
}
