import {
	type MetaFunction,
	type ActionFunctionArgs,
	Form,
	Link,
	data,
} from 'react-router'
import { z } from 'zod'

import { db } from '~/lib/db.server'
import { isHostCookie } from '~/utils/cookie'

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

	const columns = formData.getAll('column') as string[]
	const retroCategories = columns.map((column) => ({ name: column }))

	try {
		const newRetro = await db.retro.create({
			data: {
				team: 'Disturbed',
				categories: {
					create: retroCategories,
				},
			},
		})

		console.log('newRetro ', newRetro)
		return data(
			{ retroId: newRetro.id },
			{
				headers: {
					'Set-Cookie': await isHostCookie.serialize(true, { maxAge: 1800 }),
				},
			},
		)
	} catch (error) {
		console.log(error)
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

	return (
		<div className="flex h-screen flex-col justify-center items-center">
			<h1 className="text-3xl text-slate-800 font-bold">Create a new Retro board</h1>
			{retroId ? (
				<>
					<p>
						Your retro board has been created. Please share the link below with your
						team
					</p>
					<Link
						className="text-slate-800 text-lg font-bold underline"
						to={`/board/${retroId}/reflect`}>
						Go to retro
					</Link>
				</>
			) : (
				<Form className="pt-3" method="post">
					<label htmlFor="team">Team name</label>
					<input
						className="block w-80 rounded-sm border border-slate-700 bg-white p-1 mb-2"
						id="team"
						name="team"
						defaultValue="Disturbed"
					/>
					<label htmlFor="sprint">Sprint</label>
					<input
						className="block w-80 rounded-sm border border-slate-700 bg-white p-1 mb-2"
						id="sprint"
						name="sprint"
						defaultValue="0001"
					/>
					<fieldset className="my-3">
						<legend>Customize your board columns</legend>
						<input
							aria-label="First column"
							className="block w-80 rounded-sm border border-slate-700 bg-white p-1 mb-2"
							name="column"
							defaultValue="What went well"
						/>
						<input
							aria-label="Second column"
							className="block w-80 rounded-sm border border-slate-700 bg-white p-1 mb-2"
							name="column"
							defaultValue="What went wrong"
						/>
						<input
							aria-label="Third column"
							className="block w-80 rounded-sm border border-slate-700 bg-white p-1 mb-2"
							name="column"
							defaultValue="Gratitudes"
						/>
					</fieldset>
					<div className="text-center">
						<button className="rounded bg-slate-800 px-4 py-3 text-xl text-white">
							Create Retro Board
						</button>
					</div>
				</Form>
			)}
		</div>
	)
}
