import { type MetaFunction, type LoaderFunctionArgs, data } from 'react-router'
import { z } from 'zod'

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

	// get columns by retro id

	console.log('Retro ID - ', id)

	return data({
		columns: [
			{ id: '1', name: 'What went well' },
			{ id: '2', name: 'What went wrong' },
			{ id: '3', name: 'Gratitudes' },
		],
	})
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
