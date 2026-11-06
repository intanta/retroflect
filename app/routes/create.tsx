import {
	type MetaFunction,
	type ActionFunctionArgs,
	Form,
	Link,
	data,
} from 'react-router'
import { z } from 'zod'

import { Button } from '~/components/Button'
import { CopyIcon } from '~/components/Icons/CopyIcon'
import { CircledCheckIcon } from '~/components/Icons/CircledCheckIcon'

import { db } from '~/lib/db.server'
import { getSession, commitSession } from '~/lib/session.server'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Retroflect - Create new retro' },
		{ name: 'description', content: 'Create new retro board' },
	]
}

const actionDataSchema = z
	.object({
		retroId: z.string(),
	})
	.nullable()
type ActionData = z.infer<typeof actionDataSchema>

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()

	const team = formData.get('team') as string
	const sprint = formData.get('sprint') as string
	const columns = formData.getAll('column') as string[]
	const retroCategories = columns.map((column) => ({ name: column }))
	const userId = formData.get('uuid') as string

	try {
		const newRetro = await db.retro.create({
			data: {
				team: team ?? 'Anonymous Team',
				sprint: sprint ?? null,
				categories: {
					create: retroCategories,
				},
			},
		})

		const session = await getSession(request.headers.get('Cookie'))

		session.set('userId', userId)
		session.set('isHost', true)

		return data(
			{ retroId: newRetro.id },
			{
				headers: {
					'Set-Cookie': await commitSession(session),
				},
			},
		)
	} catch (error) {
		if (error instanceof Error) {
			console.log('retro create: ', error.message)
		}
		// TODO add error handling
		return null
	}
}

const createRetroPropsSchema = z.object({
	actionData: actionDataSchema,
})
type CreateRetroProps = z.infer<typeof createRetroPropsSchema>

export default function Create({ actionData }: CreateRetroProps) {
	const { retroId } = actionData || {}

	const handleCopyToClipboard = () => {
		navigator.clipboard.writeText(retroId!)
	}

	return (
		<div className="flex flex-1 flex-col sm:justify-center items-center px-2.5">
			{retroId ? (
				<div className="sm:w-2/3 md:w-[700px] bg-surface rounded-3xl p-10 shadow-lg text-center">
					<CircledCheckIcon className="mx-auto mb-8" />
					<h1 className="text-4xl text-ink font-bold">
						Your retro board has been created
					</h1>
					<p className="pt-2 text-ink-muted">
						Please share the code below with your team
					</p>
					<p className="w-full flex justify-center gap-3 text-2xl py-10">
						<span>{retroId}</span>
						<Button
							aria-label="Copy the code for your retro board to clipboard"
							variant="secondary-ghost"
							onClick={handleCopyToClipboard}>
							<CopyIcon className="size-6" />
						</Button>
					</p>
					<Link
						className="block w-full rounded-xl bg-action px-4 py-3 text-xl text-on-action text-center"
						to={`/board/${retroId}/reflect`}>
						Go to Retro
					</Link>
				</div>
			) : (
				<div className="sm:w-2/3 md:w-[600px] bg-surface rounded-3xl p-10 shadow-lg">
					<h1 className="pb-10 text-2xl text-ink font-bold">
						Create a new Retro board
					</h1>
					<Form method="post">
						<label className="text-sm text-ink-muted font-semibold" htmlFor="team">
							Team name
						</label>
						<input
							className="block w-full rounded-xl border border-line-subtle bg-surface p-2 mb-4"
							id="team"
							name="team"
							defaultValue="Disturbed"
						/>
						<label className="text-sm text-ink-muted font-semibold" htmlFor="sprint">
							Sprint
						</label>
						<input
							className="block w-full rounded-xl border border-line-subtle bg-surface p-2 mb-4"
							id="sprint"
							name="sprint"
							defaultValue="0001"
						/>
						<fieldset className="my-3">
							<legend className="text-sm text-ink-muted font-semibold">
								Customize your board columns
							</legend>
							<input
								aria-label="First column"
								className="block w-full rounded-xl border border-line-subtle bg-surface p-2 mb-3"
								name="column"
								defaultValue="What went well"
							/>
							<input
								aria-label="Second column"
								className="block w-full rounded-xl border border-line-subtle bg-surface p-2 mb-3"
								name="column"
								defaultValue="What went wrong"
							/>
							<input
								aria-label="Third column"
								className="block w-full rounded-xl border border-line-subtle bg-surface p-2 mb-3"
								name="column"
								defaultValue="Gratitudes"
							/>
						</fieldset>
						<input type="hidden" name="uuid" value={crypto.randomUUID()} />
						<Button
							type="submit"
							variant="primary"
							className="block w-full mt-10 py-4">
							Create Retro Board
						</Button>
					</Form>
				</div>
			)}
		</div>
	)
}
