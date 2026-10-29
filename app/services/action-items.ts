import { z } from 'zod'
import { db } from '~/lib/db.server'

// TODO - sorting should come in params
export const getActionItems = async (sort: string, direction: string) => {
	try {
		return await db.action.findMany({
			orderBy: [
				{
					createdAt: 'desc',
				},
			],
			select: {
				id: true,
				text: true,
				assignee: true,
				createdAt: true,
				status: true,
			},
		})
	} catch (error) {
		throw error
	}
}

type ActionItemStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'NOT_NEEDED'

export const updateActionItemStatus = async (
	id: string,
	status: ActionItemStatus,
) => {
	try {
		await db.action.update({
			where: {
				id: id,
			},
			data: {
				status: status,
			},
		})
	} catch (error) {
		throw error
	}
}
