import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	type MetaFunction,
	data,
	Link,
	useFetcher,
} from 'react-router'
import { useEffect, useId, useState } from 'react'
import { boolean, z } from 'zod'

import { getActionItems, updateActionItemStatus } from '~/services/action-items'

import { logError } from '~/utils/helpers'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Retroflect - Action Items' },
		{
			name: 'description',
			content: 'View your action items and update their status',
		},
	]
}

type ActionItemStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'NOT_NEEDED'

type ActionItem = {
	id: string
	text: string
	assignee: string
	status: ActionItemStatus
	createdAt: Date
}

// Order used when sorting by status rather than alphabetically.
const STATUS_SORT_ORDER: Record<ActionItemStatus, number> = {
	NEW: 0,
	IN_PROGRESS: 1,
	COMPLETED: 2,
	NOT_NEEDED: 3,
}

const STATUS_OPTIONS: ActionItemStatus[] = [
	'NEW',
	'IN_PROGRESS',
	'COMPLETED',
	'NOT_NEEDED',
]

const SORTABLE_COLUMNS = ['status', 'createdAt'] as const
type SortableColumn = (typeof SORTABLE_COLUMNS)[number]
type SortDirection = 'asc' | 'desc'

// In-memory store to emulate persistence for this POC (no backend/service call).
// let actionItemsStore: ActionItem[] = [
// 	{
// 		id: '1',
// 		text: 'Confirm inbound rules match the latest security policy.',
// 		assignee: 'John Doe',
// 		status: 'New',
// 		createdAt: '2026-09-20T10:00:00.000Z',
// 	},
// 	{
// 		id: '2',
// 		text: 'Add the new site manager as a secondary contact.',
// 		assignee: 'Priya Patel',
// 		status: 'In Progress',
// 		createdAt: '2026-09-18T14:30:00.000Z',
// 	},
// 	{
// 		id: '3',
// 		text: 'Coordinate cutover window with the customer.',
// 		assignee: 'John Doe',
// 		status: 'Completed',
// 		createdAt: '2026-09-10T09:15:00.000Z',
// 	},
// 	{
// 		id: '4',
// 		text: 'Book a technician visit for the downtown location.',
// 		assignee: 'Maria Chen',
// 		status: 'Not Needed',
// 		createdAt: '2026-09-05T08:00:00.000Z',
// 	},
// 	{
// 		id: '5',
// 		text: 'Generate and distribute new keys to the integration team.',
// 		assignee: 'Sam Osei',
// 		status: 'New',
// 		createdAt: '2026-09-25T16:45:00.000Z',
// 	},
// 	{
// 		id: '6',
// 		text: 'Verify the upgrade request was received by provisioning.',
// 		assignee: 'Priya Patel',
// 		status: 'In Progress',
// 		createdAt: '2026-09-22T11:20:00.000Z',
// 	},
// 	{
// 		id: '7',
// 		text: 'Move resolved tickets older than 90 days to the archive.',
// 		assignee: 'Maria Chen',
// 		status: 'Completed',
// 		createdAt: '2026-09-01T13:00:00.000Z',
// 	},
// 	{
// 		id: '8',
// 		text: 'Assess cost and feasibility of a secondary carrier.',
// 		assignee: 'Sam Osei',
// 		status: 'Not Needed',
// 		createdAt: '2026-08-28T09:30:00.000Z',
// 	},
// ]

function isSortableColumn(value: string | null): value is SortableColumn {
	return SORTABLE_COLUMNS.includes(value as SortableColumn)
}

function formatDate(isoDate: string) {
	return new Intl.DateTimeFormat('en-US', {
		dateStyle: 'medium',
	}).format(new Date(isoDate))
}

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url)
	const requestedSort = url.searchParams.get('sort')
	const sort: SortableColumn = isSortableColumn(requestedSort)
		? requestedSort
		: 'createdAt'
	const direction: SortDirection =
		url.searchParams.get('dir') === 'desc' ? 'desc' : 'asc'

	// const sortedActionItems = actionItemsStore.sort((a, b) => {
	// 	const comparison =
	// 		sort === 'status'
	// 			? STATUS_SORT_ORDER[a.status] - STATUS_SORT_ORDER[b.status]
	// 			: a.createdAt.localeCompare(b.createdAt)

	// 	return direction === 'desc' ? -comparison : comparison
	// })

	try {
		const actionItems = await getActionItems(sort, direction)

		return data({ actionItems })
	} catch (error) {
		logError(error, 'Reflect loader: ')

		// TODO create an error boundary
		return data({
			actionItems: [],
		})
	}
}

const actionResultSchema = z.object({
	success: z.boolean(),
	error: z.string().nullable(),
	updatedStatus: z.string().nullable(),
})
type ActionResult = z.infer<typeof actionResultSchema>

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const id = formData.get('id') as string
	const status = formData.get('status') as ActionItemStatus

	// Simulated network latency so this POC can demonstrate the loading indicator without a real backend.
	// await new Promise((resolve) => setTimeout(resolve, 1200))

	// const actionItem = actionItemsStore.find((item) => item.id === id)

	// if (!actionItem) {
	// 	return {
	// 		ok: false as const,
	// 		updatedId: id,
	// 		error: 'Item not found.',
	// 	}
	// }

	// // Simulated, occasional failure so this POC can demonstrate error handling without a real backend.
	// const didRequestFail = Math.random() < 0.2
	// if (didRequestFail) {
	// 	return {
	// 		ok: false as const,
	// 		updatedId: id,
	// 		error: 'Update failed. Try again.',
	// 	}
	// }

	// actionItemsStore = actionItemsStore.map((item) =>
	// 	item.id === id ? { ...item, status } : item,
	// )

	try {
		await updateActionItemStatus(id, status)

		return data({ success: true, error: null, updatedStatus: status })
	} catch (error) {
		logError(error, 'Reflect action: ')

		return data(
			{ success: false, error: 'Error updating status', updatedStatus: null },
			{ status: 500 },
		)
	}

	//return { ok: true as const, updatedId: id, updatedStatus: status }
}

function getSortHref(
	column: SortableColumn,
	currentSort: SortableColumn,
	currentDirection: SortDirection,
) {
	const nextDirection: SortDirection =
		currentSort === column && currentDirection === 'asc' ? 'desc' : 'asc'
	return `?sort=${column}&dir=${nextDirection}`
}

type SortableHeaderProps = {
	column: SortableColumn
	label: string
	currentSort: SortableColumn
	currentDirection: SortDirection
	className?: string
}

function SortableHeader({
	column,
	label,
	currentSort,
	currentDirection,
	className,
}: SortableHeaderProps) {
	const isActive = currentSort === column
	const ariaSort = isActive
		? currentDirection === 'asc'
			? 'ascending'
			: 'descending'
		: 'none'
	const nextDirectionLabel =
		isActive && currentDirection === 'asc' ? 'descending' : 'ascending'

	return (
		<th scope="col" aria-sort={ariaSort} className={className}>
			<Link
				to={getSortHref(column, currentSort, currentDirection)}
				aria-label={`Sort by ${label}, ${nextDirectionLabel}`}
				className="flex items-center gap-1 font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
				{label}
				<span aria-hidden="true">
					{isActive ? (currentDirection === 'asc' ? '▲' : '▼') : '↕'}
				</span>
			</Link>
		</th>
	)
}

type ActionItemRowProps = {
	item: ActionItem
}

function ActionItemRow({ item }: ActionItemRowProps) {
	const fetcher = useFetcher<ActionResult>()
	const selectId = useId()
	const errorId = useId()
	// Optimistic value shown while a change is in flight; cleared once the fetcher settles so the
	// select falls back to the committed `item.status` (new value on success, prior value on failure).
	const [pendingStatus, setPendingStatus] = useState<ActionItemStatus | null>(null)

	const isSubmittingThisRow =
		fetcher.state !== 'idle' && fetcher.formData?.get('id') === String(item.id)
	const errorMessage =
		fetcher.state === 'idle' && fetcher.data?.error ? fetcher.data?.error : null

	useEffect(() => {
		if (fetcher.state === 'idle') {
			setPendingStatus(null)
		}
	}, [fetcher.state])

	const displayedStatus = pendingStatus ?? item.status
	const rowClassName =
		displayedStatus === 'COMPLETED'
			? 'bg-green-100'
			: displayedStatus === 'NOT_NEEDED'
				? 'text-gray-400 bg-gray-50'
				: ''

	return (
		<tr className={`border-b border-gray-300 text-sm ${rowClassName}`}>
			<td className="p-3 align-top">{item.text}</td>
			<td className="hidden p-3 align-top md:table-cell">{item.assignee}</td>
			<td className="p-3 align-top">
				<fetcher.Form method="post">
					<input type="hidden" name="id" value={item.id} />
					<label htmlFor={selectId} className="sr-only">
						Status for {item.text}
					</label>
					<select
						id={selectId}
						name="status"
						value={displayedStatus}
						aria-describedby={errorMessage ? errorId : undefined}
						aria-invalid={Boolean(errorMessage)}
						onChange={(event) => {
							const nextStatus = event.target.value as ActionItemStatus
							setPendingStatus(nextStatus)
							event.currentTarget.form?.requestSubmit()
						}}
						className="w-full rounded border border-gray-400 bg-white p-1">
						{STATUS_OPTIONS.map((statusOption) => (
							<option key={statusOption} value={statusOption} className="capitalize">
								{statusOption.toLowerCase().replaceAll('_', ' ')}
							</option>
						))}
					</select>
				</fetcher.Form>
				{/* Fixed height and always rendered (even empty) so this row's height never changes and this
        never overlaps adjacent rows — absolutely-positioned overlays get painted behind sibling
        table row backgrounds while still intercepting clicks, which blocked the rows below. */}
				<div
					role={errorMessage ? 'alert' : isSubmittingThisRow ? 'status' : undefined}
					id={errorMessage ? errorId : undefined}
					className={`mt-1 h-9 text-sm leading-tight ${errorMessage ? 'text-red-700' : 'text-gray-600'}`}>
					{errorMessage ?? (isSubmittingThisRow ? 'Saving…' : '')}
				</div>
				<span aria-live="polite" className="sr-only">
					{fetcher.data?.success
						? `Status for ${item.text} updated to ${fetcher.data?.updatedStatus}`
						: ''}
				</span>
			</td>
			<td className="hidden p-3 align-top md:table-cell">
				{formatDate(item.createdAt.toDateString())}
			</td>
		</tr>
	)
}

const loaderDataSchema = z.object({
	actionItems: z.array(z.any()), // TODO fix
})

type StatusTablePocProps = {
	loaderData: z.infer<typeof loaderDataSchema>
}

export default function StatusTablePoc({ loaderData }: StatusTablePocProps) {
	const { actionItems } = loaderData

	return (
		<main className="p-6">
			<h1 className="mb-2 text-2xl font-bold">Action Items</h1>
			<p className="mb-4 text-gray-700">
				Changing an item&apos;s status saves immediately. Completed items are
				highlighted in green; items marked Not Needed are greyed out.
			</p>
			<div className="overflow-x-auto">
				<table className="w-full table-fixed border-collapse text-left bg-white">
					<caption className="sr-only">
						Action items, sortable by status and creation date
					</caption>
					{/* Fixed layout + explicit column widths keep the Status column's width stable, since the
          floating error message inside it must not resize the table. Title has no set width, so it
          takes whatever space remains (all of it on mobile, once the other columns are hidden). */}
					<colgroup>
						<col />
						<col className="hidden md:table-column md:w-1/4" />
						<col className="w-48" />
						<col className="hidden md:table-column md:w-44" />
					</colgroup>
					<thead>
						<tr className="border-b border-gray-300">
							<th scope="col" className="p-3 font-semibold">
								Description
							</th>
							<th scope="col" className="hidden p-3 font-semibold md:table-cell">
								Assignee
							</th>
							<th scope="col" className="p-3 font-semibold">
								Status
							</th>
							<th scope="col" className="hidden p-3 font-semibold md:table-cell">
								Created
							</th>
							{/* <SortableHeader
								column="status"
								label="Status"
								currentSort={sort}
								currentDirection={direction}
								className="p-3"
							/>
							<SortableHeader
								column="createdAt"
								label="Created"
								currentSort={sort}
								currentDirection={direction}
								className="hidden p-3 md:table-cell"
							/> */}
						</tr>
					</thead>
					<tbody>
						{actionItems.map((item: ActionItem) => (
							<ActionItemRow key={item.id} item={item} />
						))}
					</tbody>
				</table>
			</div>
		</main>
	)
}
