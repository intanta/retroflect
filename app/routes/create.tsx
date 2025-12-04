import {
	type MetaFunction,
	type ActionFunctionArgs,
	Form,
	Link,
	data,
} from 'react-router'
import { z } from 'zod'

import { CopyIcon } from '~/components/Icons/CopyIcon'

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
				team: team ?? 'Unknown team',
				sprint: sprint ?? null,
				categories: {
					create: retroCategories,
				},
			},
		})

		// const hostUser = await db.user.create({
		// 	data: {
		// 		retroId: newRetro.id,
		// 	},
		// })

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
		<div className="flex h-screen flex-col justify-center items-center">
			<h1 className="pb-3 text-3xl text-slate-800 font-bold">
				Create a new Retro board
			</h1>
			{retroId ? (
				<>
					<p className="py-2">
						Your retro board has been created. Please share the code below with your
						team
					</p>
					<p className="flex gap-3 text-2xl pb-3">
						<span>{retroId}</span>
						<button
							aria-label="Copy the code for your retro board to clipboard"
							className="cursor-pointer"
							type="button"
							onClick={handleCopyToClipboard}>
							<CopyIcon className="size-6" />
						</button>
					</p>
					<Link
						className="text-slate-800 text-lg font-bold underline"
						to={`/board/${retroId}/reflect`}>
						Go to retro
					</Link>
				</>
			) : (
				<Form className="pt-3" method="post">
					<label className="text-sm font-semibold" htmlFor="team">
						Team name
					</label>
					<input
						className="block w-80 rounded-sm border border-slate-700 bg-white p-2 mb-2"
						id="team"
						name="team"
						defaultValue="Disturbed"
					/>
					<label className="text-sm font-semibold" htmlFor="sprint">
						Sprint
					</label>
					<input
						className="block w-80 rounded-sm border border-slate-700 bg-white p-2 mb-2"
						id="sprint"
						name="sprint"
						defaultValue="0001"
					/>
					<fieldset className="my-3">
						<legend className="text-sm font-semibold">
							Customize your board columns
						</legend>
						<input
							aria-label="First column"
							className="block w-80 rounded-sm border border-slate-700 bg-white p-2 mb-2"
							name="column"
							defaultValue="What went well"
						/>
						<input
							aria-label="Second column"
							className="block w-80 rounded-sm border border-slate-700 bg-white p-2 mb-2"
							name="column"
							defaultValue="What went wrong"
						/>
						<input
							aria-label="Third column"
							className="block w-80 rounded-sm border border-slate-700 bg-white p-2 mb-2"
							name="column"
							defaultValue="Gratitudes"
						/>
					</fieldset>
					<input type="hidden" name="uuid" value={crypto.randomUUID()} />
					<div className="text-center pt-3">
						<button className="rounded bg-slate-800 px-4 py-3 text-xl text-white cursor-pointer">
							Create Retro Board
						</button>
					</div>
				</Form>
			)}
		</div>
	)
}
