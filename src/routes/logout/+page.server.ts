import { redirect } from '@sveltejs/kit';
import { destroySession, getSessionCookie } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	redirect(302, '/login');
};

export const actions: Actions = {
	default: async ({ cookies }) => {
		const token = cookies.get(getSessionCookie());
		if (token) destroySession(token);
		cookies.delete(getSessionCookie(), { path: '/' });
		redirect(302, '/login');
	}
};
