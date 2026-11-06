import { type MetaFunction } from 'react-router'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Retroflect - Thank you' },
		{ name: 'description', content: 'Retro is now closed' },
	]
}

export default function ClosedRetro() {
	return (
		<div className="flex flex-1 flex-col justify-center items-center gap-5">
			<h1 className="text-4xl font-bold">Thank you!</h1>
			<p className="text-3xl">Your retro is now closed. See you next time! 👋</p>
		</div>
	)
}
