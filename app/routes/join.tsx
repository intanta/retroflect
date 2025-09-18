import {
	type ActionFunctionArgs,
	type MetaFunction,
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

	try {
		const newUser = await db.user.create({
			data: {
				retroId,
			},
		})

		console.log('newUser ', newUser)

		const session = await getSession(request.headers.get('Cookie'))

		session.set('userId', newUser.id)

		// TODO get actual retro status and redirect there? and if closed - show error
		return redirect(`/board/${retroId}/reflect`, {
			headers: {
				'Set-Cookie': await commitSession(session),
			},
		})
	} catch (error) {
		console.log(error)
		// TODO add error handling
		return null
	}
}

export default function Join() {
	return (
		<div className="flex h-screen flex-col justify-center items-center">
			<h1 className="text-3xl text-slate-800 font-bold pb-3">
				Join your team's Retro board
			</h1>
			<Form className="pt-3" method="post">
				<label htmlFor="team">Enter the board code</label>
				<input
					className="block w-80 rounded-sm border border-slate-700 bg-white p-1 mb-2"
					id="retro-id"
					name="retro-id"
				/>
				<div className="text-center pt-2">
					<button className="rounded bg-slate-800 px-4 py-3 text-xl text-white">
						Join
					</button>
				</div>
			</Form>
		</div>
	)
}
