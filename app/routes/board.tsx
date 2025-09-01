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

import { db } from '~/lib/db.server'
import { isHostCookie } from '~/utils/cookie'

export const meta: MetaFunction = () => {
	return [{ title: 'Retroflect - Retro in progress' }]
}

const loaderDataSchema = z.object({
	isHost: z.boolean(),
	status: z.string(),
})

export async function loader({ params, request }: LoaderFunctionArgs) {
	const { id } = params

	// get status, team, sprint by retro id
	const retro = await db.retro.findUnique({
		where: {
			id,
		},
		select: {
			status: true,
		},
	})

	console.log('Retro ID - ', id)

	const cookieHeader = request.headers.get('Cookie')
	const cookie = (await isHostCookie.parse(cookieHeader)) || null

	return data({
		isHost: Boolean(cookie),
		status: retro?.status,
	})
}

export async function action({ request, params }: ActionFunctionArgs) {
	const { id } = params

	const formData = await request.formData()

	const retroStatus = formData.get('retroStatus') as string

	console.log('retroStatus ', retroStatus)

	// TODO ts-pattern; rename status to step?; typescript this duh
	const stepsMapping: any = {
		REFLECT: 'VOTE',
		VOTE: 'REVIEW',
		REVIEW: null,
	}
	const nextRetroStep = stepsMapping[retroStatus]

	if (nextRetroStep) {
		await db.retro.update({
			where: {
				id,
			},
			data: {
				status: nextRetroStep,
			},
		})

		return redirect(nextRetroStep.toLowerCase())
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
		REFLECT: {
			heading: "Let's reflect",
			link: 'vote',
		},
		VOTE: {
			heading: "Let's vote",
			link: 'review',
		},
		REVIEW: {
			heading: "Let's discuss",
			link: null,
		},
	}

	if (!config[status]) {
		return <p>Oops, something went terribly wrong, no retro, sorry</p>
	}

	return (
		<div className="flex h-screen flex-col p-5">
			<div className="flex justify-between py-5 border-b">
				<h1 className="text-2xl font-bold">{config[status].heading}</h1>
				{isHost && config[status].link ? (
					<Form method="post">
						<input type="hidden" name="retroStatus" value={status} />
						<button
							className="text-slate-800 text-lg font-bold underline cursor-pointer"
							type="submit">
							Go to the next step
						</button>
					</Form>
				) : null}
				{!isHost && config[status].link ? (
					<Link
						className="text-slate-800 text-lg font-bold underline"
						to={config[status].link}>
						Go to the next step
					</Link>
				) : null}
			</div>
			<Outlet context={{ retroStatus: status }} />
		</div>
	)
}
