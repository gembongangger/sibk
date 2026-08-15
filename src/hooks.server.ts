import type { Handle, HandleServerError } from '@sveltejs/kit';
import { findSessionUser, getSessionCookie } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(getSessionCookie());
	event.locals.user = token ? findSessionUser(token) : null;
	return resolve(event);
};

export const handleError: HandleServerError = ({ error }) => {
	return {
		message: error instanceof Error ? error.message : 'Terjadi kesalahan.'
	};
};
