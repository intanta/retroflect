import { z } from 'zod'

export const logError = (error: unknown, label?: string) => {
	if (error instanceof z.ZodError) {
		const flattenedErrors = z.flattenError(error).fieldErrors

		console.error(
			label ? `${label} - Zod error: ` : 'Zod error: ',
			JSON.stringify(flattenedErrors),
		)
		return
	}

	const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)

	console.error(label ? `${label}: ${errorMessage}` : errorMessage)
}
