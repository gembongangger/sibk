import { redirect, fail } from '@sveltejs/kit';
import { login, createSession, getSessionCookie } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) redirect(302, '/');
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const username = String(form.get('username') ?? '').trim();
		const password = String(form.get('password') ?? '');

		if (!username || !password) {
			return fail(400, { error: 'Username dan password wajib diisi.', username });
		}

		const user = login(username, password);
		if (!user) {
			return fail(400, { error: 'Username atau password salah.', username });
		}

		const token = createSession(user.id);
		cookies.set(getSessionCookie(), token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 7 * 24 * 60 * 60
		});

		redirect(302, '/');
	}
};
