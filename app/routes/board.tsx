import {
	type MetaFunction,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	data,
	Form,
	Link,
	Outlet,
	redirect,
	useParams,
} from 'react-router'
import { useEffect, useState } from 'react'
import { z } from 'zod'

import { db } from '~/lib/db.server'
import { getSession } from '~/lib/session.server'
import { supabase } from '~/lib/supabase'
import { Button } from '~/components/Button'
import type { RouteHandle } from '~/root'

export const handle: RouteHandle = { showProgress: true }

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

	const session = await getSession(request.headers.get('Cookie'))

	return data({
		isHost: session.get('isHost'),
		status: retro?.status,
	})
}

export async function action({ request, params }: ActionFunctionArgs) {
	const { id } = params

	const formData = await request.formData()

	const retroStatus = formData.get('retroStatus') as string

	// TODO ts-pattern; rename status to step?; typescript this duh
	const stepsMapping: any = {
		REFLECT: 'VOTE',
		VOTE: 'REVIEW',
		REVIEW: 'CLOSED',
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

		// TODO handle this better
		if (nextRetroStep === 'CLOSED') {
			return redirect('/closed')
		}

		return redirect(nextRetroStep.toLowerCase())
	}

	return null
}

const boardPropsSchema = z.object({
	loaderData: loaderDataSchema,
})
type BoardProps = z.infer<typeof boardPropsSchema>

export default function Board({ loaderData }: BoardProps) {
	const [isNextStepAvailable, setIsNextStepAvailable] = useState(false)
	const urlParams = useParams()
	const retroId = urlParams.id
	const { status, isHost } = loaderData

	useEffect(() => {
		supabase
			.channel('retro_changes')
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'Retro',
					filter: `id=eq.${retroId}`,
				},
				(payload) => {
					if (payload.new.status !== status) {
						console.log('retro status changed to ', payload.new.status)
						setIsNextStepAvailable(true)
					}
				},
			)
			.subscribe((status) => {
				console.log(status)
			})
	}, [])

	useEffect(() => {
		setIsNextStepAvailable(false)
	}, [status])

	const config: any = {
		REFLECT: {
			heading: "Let's reflect",
			ctaLabel: 'Go to the next step',
			ctaLink: 'vote',
		},
		VOTE: {
			heading: "Let's vote",
			ctaLabel: 'Go to the next step',
			ctaLink: 'review',
		},
		REVIEW: {
			heading: "Let's discuss",
			ctaLabel: 'Complete retro',
			ctaLink: '/closed',
		},
	}

	// TODO make this Error boundary
	if (!config[status]) {
		return <p>Oops, something went terribly wrong, no retro, sorry</p>
	}

	return (
		<div className="flex flex-1 flex-col p-5 md:p-10 bg-surface rounded-3xl">
			<div className="flex justify-between items-center pb-5">
				<h1 className="text-2xl md:text-4xl font-bold">{config[status].heading}</h1>
				{isHost ? (
					<Form method="post">
						<input type="hidden" name="retroStatus" value={status} />
						<Button variant="primary" type="submit" className="px-4 py-2 md:py-3">
							{config[status].ctaLabel}
						</Button>
					</Form>
				) : null}
				{!isHost && isNextStepAvailable && config[status].ctaLink ? (
					<Link
						className="rounded-xl bg-action px-4 py-3 text-xl text-on-action"
						to={config[status].ctaLink}>
						{config[status].ctaLabel}
					</Link>
				) : null}
			</div>
			<Outlet context={{ retroStatus: status }} />
		</div>
	)
}
