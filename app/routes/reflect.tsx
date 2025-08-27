import { type MetaFunction, type LoaderFunctionArgs, data } from 'react-router'
import { z } from 'zod'

import { db } from '~/lib/db.server'

import { BoardColumn } from '~/components/BoardColumn'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Retroflect - Fill out the board' },
		{ name: 'description', content: 'Fill out the retro board' },
	]
}

const columnSchema = z.object({
	id: z.string(),
	name: z.string(),
})
const columnListSchema = z.array(columnSchema)

const loaderDataSchema = z.object({
	columns: columnListSchema,
})

export async function loader({ params }: LoaderFunctionArgs) {
	const { id } = params

	try {
		const columns = await db.category.findMany({
			where: {
				retroId: id,
			},
		})
		return data({ columns })
	} catch (error) {
		console.log(error)
		// TODO create an error boundary
		return data({
			columns: [
				{ id: '1', name: 'Something' },
				{ id: '2', name: 'Went' },
				{ id: '3', name: 'Wrong' },
			],
		})
	}
}

const boardPropsSchema = z.object({
	loaderData: loaderDataSchema,
})
type BoardProps = z.infer<typeof boardPropsSchema>

export default function Reflect({ loaderData }: BoardProps) {
	const { columns } = loaderData

	return columns?.length ? (
		<div className="grid grid-cols-3 gap-4">
			{columns.map((column) => (
				<BoardColumn key={column.id} id={column.id} name={column.name} />
			))}
		</div>
	) : null
}
