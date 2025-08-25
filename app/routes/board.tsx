import {
	type MetaFunction,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	data,
	Form,
	Link,
	Outlet,
	redirect,
} from 'react-router'
import { z } from 'zod'

export const meta: MetaFunction = () => {
	return [{ title: 'Retroflect - Retro in progress' }]
}

const loaderDataSchema = z.object({
	isHost: z.boolean(),
	status: z.string(),
})

export async function loader({ params }: LoaderFunctionArgs) {
	const { id } = params

	// get status, team, sprint by retro id

	console.log('Retro ID - ', id)

	return data({
		isHost: true,
		status: 'reflect',
	})
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()

	const retroStatus = formData.get('retroStatus') as string

	console.log('retroStatus ', retroStatus)

	// TODO ts-pattern; rename status to step
	const stepsMapping: any = {
		reflect: 'vote',
		vote: 'review',
		review: null,
	}
	const nextRetroStep = stepsMapping[retroStatus]

	// TODO update retro status in db

	if (nextRetroStep) {
		return redirect(nextRetroStep)
	}

	return null
}

const boardPropsSchema = z.object({
	loaderData: loaderDataSchema,
})
type BoardProps = z.infer<typeof boardPropsSchema>

export default function Board({ loaderData }: BoardProps) {
	const { status, isHost } = loaderData

	const config: any = {
		reflect: {
			heading: "Let's reflect",
			link: 'vote',
		},
		vote: {
			heading: "Let's vote",
			link: 'review',
		},
	}

	if (!config[status]) {
		return <p>Oops, something went terribly wrong, no retro, sorry</p>
	}

	return (
		<div className="flex h-screen flex-col p-5">
			<div className="flex justify-between py-5 border-b">
				<h1 className="text-xl">{config[status].heading}</h1>
				{isHost ? (
					<Form method="post">
						<input type="hidden" name="retroStatus" value={status} />
						<button
							className="text-slate-800 text-lg font-bold underline"
							type="submit">
							Go to the next step
						</button>
					</Form>
				) : (
					<Link
						className="text-slate-800 text-lg font-bold underline"
						to={config[status].link}>
						Go to the next step
					</Link>
				)}
			</div>
			<Outlet context={{ retroStatus: status }} />
		</div>
	)
}
