import {
	isRouteErrorResponse,
	Link,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useMatches,
} from 'react-router'

import type { Route } from './+types/root'
import './app.css'
import { LogoIcon } from '~/components/Icons/Logo'

/**
 * Routes can export `handle: RouteHandle` to control the shared header.
 * The flag also applies to a route's child routes.
 */
export type RouteHandle = {
	showProgress?: boolean
}

function SiteHeader() {
	const matches = useMatches()
	const showProgress = matches.some(
		(match) => (match.handle as RouteHandle | undefined)?.showProgress,
	)

	return (
		<header className="flex items-center justify-between px-5 py-5">
			<Link to="/" className="flex items-center gap-2 text-ink">
				<LogoIcon className="w-8 h-8" />
				<span className="text-xl font-bold">Retroflect</span>
			</Link>
			{showProgress ? (
				// TODO replace with <ProgressBar status={...} /> (status is in the board match's data)
				<div data-testid="progress-placeholder" />
			) : null}
		</header>
	)
}

export const links: Route.LinksFunction = () => [
	{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
	{
		rel: 'preconnect',
		href: 'https://fonts.gstatic.com',
		crossOrigin: 'anonymous',
	},
	{
		rel: 'stylesheet',
		href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
	},
]

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body className="flex min-h-screen flex-col">
				<SiteHeader />
				<main className="flex flex-1 flex-col px-5 pb-5">{children}</main>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	)
}

export default function App() {
	return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = 'Oops!'
	let details = 'An unexpected error occurred.'
	let stack: string | undefined

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? '404' : 'Error'
		details =
			error.status === 404
				? 'The requested page could not be found.'
				: error.statusText || details
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message
		stack = error.stack
	}

	return (
		<div className="pt-16 p-4 container mx-auto">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</div>
	)
}
