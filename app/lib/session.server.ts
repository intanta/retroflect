import { createCookieSessionStorage } from 'react-router'

type SessionData = {
	userId: string
	isHost: boolean
}

type SessionFlashData = {
	error: string
}

const { getSession, commitSession, destroySession } = createCookieSessionStorage<
	SessionData,
	SessionFlashData
>({
	// a Cookie from `createCookie` or the CookieOptions to create one
	cookie: {
		name: 'rf_session',
		maxAge: 7200,
	},
})

export { getSession, commitSession, destroySession }
