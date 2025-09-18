import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
	index('routes/home.tsx'),
	route('create', './routes/create.tsx'),
	route('join', './routes/join.tsx'),
	route('board/:id', './routes/board.tsx', [
		route('reflect', './routes/reflect.tsx', [
			route('add-comment', './routes/add-comment.ts'),
			route('delete-comment', './routes/delete-comment.ts'),
		]),
		route('vote', './routes/vote.tsx'),
		route('review', './routes/review.tsx'),
	]),
	route('closed', './routes/closed.tsx'),
] satisfies RouteConfig
