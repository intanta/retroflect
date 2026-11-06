import { type MetaFunction, Link } from 'react-router'
import { LogoIcon } from '~/components/Icons/Logo'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Retroflect - Home' },
		{ name: 'description', content: 'Welcome to Retroflect!' },
	]
}

export default function Home() {
	return (
		<div className="flex flex-1 flex-col justify-center px-2.5">
			<LogoIcon className="size-16 mx-auto mb-8" />
			<h1 className="text-4xl text-ink text-center font-bold pb-5">
				Welcome to Retroflect!
			</h1>
			<div className="w-full sm:w-[400px] flex flex-col gap-2 mx-auto">
				<Link
					className="w-full rounded-xl bg-action px-4 py-3 text-xl text-on-action text-center"
					to="/create">
					Create a New Retro
				</Link>
				<div className="flex w-full items-center gap-3 py-2 text-ink-muted">
					<span aria-hidden="true" className="h-px flex-1 bg-line-disabled" />
					<span>OR</span>
					<span aria-hidden="true" className="h-px flex-1 bg-line-disabled" />
				</div>
				<Link
					className="w-full rounded-xl bg-action px-4 py-3 text-xl text-on-action text-center"
					to="/join">
					Join a Retro
				</Link>
			</div>
		</div>
	)
}
