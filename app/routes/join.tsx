import {
	type ActionFunctionArgs,
	type MetaFunction,
	data,
	Form,
	redirect,
} from 'react-router'

import { db } from '~/lib/db.server'
import { getSession, commitSession } from '~/lib/session.server'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Retroflect - Join retro' },
		{ name: 'description', content: 'Join an existing retro board' },
	]
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()

	const retroId = formData.get('retro-id') as string
	const userId = formData.get('uuid') as string
	console.log('user id ', userId)

	try {
		// const newUser = await db.user.create({
		// 	data: {
		// 		retroId,
		// 	},
		// })

		// console.log('newUser ', newUser)
		const retro = await db.retro.findUnique({
			where: {
				id: retroId.trim(),
			},
			select: {
				status: true,
			},
		})

		if (!retro) {
			return data({
				errorMessage:
					'Hmmm... Looks like the retro board with this ID does not exist! Please check your input and try again.',
			})
		}

		if (retro.status === 'CLOSED') {
			return data({
				errorMessage:
					'Sorry, the retro board with this ID is already closed, and you missed it. Better luck next time!',
			})
		}

		const session = await getSession(request.headers.get('Cookie'))

		session.set('userId', userId)

		return redirect(`/board/${retroId}/${retro.status.toLowerCase()}`, {
			headers: {
				'Set-Cookie': await commitSession(session),
			},
		})
	} catch (error) {
		if (error instanceof Error) {
			console.log(error.message)
		}

		return data({
			errorMessage:
				'Something very unfortunate and very unexpected happened. Please try again in a new session',
		})
	}
}

export default function Join({ actionData }) {
	const error = actionData?.errorMessage

	return (
		<div className="flex h-screen flex-col justify-center items-center">
			<h1 className="text-3xl text-slate-800 font-bold pb-3">
				Join your team's Retro board
			</h1>
			{error ? <p className="text-red-700 text-center">{error}</p> : null}
			<Form className="pt-3" method="post">
				<label htmlFor="retro-id">Enter the board code</label>
				<input
					className="block w-94 rounded-sm border border-slate-700 bg-white p-2 mb-2"
					id="retro-id"
					name="retro-id"
				/>
				<input type="hidden" name="uuid" value={crypto.randomUUID()} />
				<div className="text-center pt-2">
					<button className="rounded bg-slate-800 px-4 py-3 text-xl text-white">
						Join
					</button>
				</div>
			</Form>
		</div>
	)
}
