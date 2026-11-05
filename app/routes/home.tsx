import { type MetaFunction, Link } from 'react-router'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Retroflect - Home' },
		{ name: 'description', content: 'Welcome to Retroflect!' },
	]
}

export default function Home() {
	return (
		<div className="flex h-screen flex-col justify-center">
			<h1 className="text-3xl text-ink text-center font-bold pb-5">
				Welcome to Retroflect!
			</h1>
			<div className="flex flex-col items-center gap-2">
				<Link
					className="rounded bg-action px-4 py-3 text-xl text-on-action"
					to="/create">
					Create a New Retro
				</Link>
				<p className="py-2">OR</p>
				<Link
					className="rounded bg-action px-4 py-3 text-xl text-on-action"
					to="/join">
					Join a Retro
				</Link>
			</div>
		</div>
	)
}
