import {
	type ActionFunctionArgs,
	type MetaFunction,
	data,
	Form,
	redirect,
} from 'react-router'

import { db } from '~/lib/db.server'
import { getSession, commitSession } from '~/lib/session.server'

import { logError } from '~/utils/helpers'
import { Button } from '~/components/Button'

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

	try {
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
		logError(error, 'join: ')

		return data({
			errorMessage:
				'Something very unfortunate and very unexpected happened. Please try again in a new session',
		})
	}
}

export default function Join({ actionData }) {
	const error = actionData?.errorMessage

	return (
		<div className="flex flex-1 flex-col sm:justify-center items-center px-2.5">
			<div className="sm:w-2/3 md:w-[700px] bg-surface rounded-3xl p-10 shadow-lg">
				<h1 className="text-4xl text-ink font-bold pb-3 text-center">
					Join your team's Retro board
				</h1>
				{error ? <p className="text-danger-ink text-center">{error}</p> : null}
				<Form className="pt-3" method="post">
					<label className="text-sm text-ink-muted font-semibold" htmlFor="retro-id">
						Enter the board code
					</label>
					<input
						className="block w-full rounded-xl border border-line-subtle bg-surface p-2 mb-4"
						id="retro-id"
						name="retro-id"
					/>
					<input type="hidden" name="uuid" value={crypto.randomUUID()} />
					<Button
						type="submit"
						variant="primary"
						className="block w-full mt-10 py-4">
						Join Retro
					</Button>
				</Form>
			</div>
		</div>
	)
}
