import { redirect, fail } from '@sveltejs/kit';
import { login, createSession, getSessionCookie } from '$lib/server/auth';
import { getMoodleConfig, findOrCreateSiswaByUsername } from '$lib/server/db';
import { verifyMoodleLogin } from '$lib/server/moodle';
import type { Actions, PageServerLoad } from './$types';

function setAuthCookie(cookies: Parameters<Actions['sibk']>[0]['cookies'], userId: number) {
	const token = createSession(userId);
	cookies.set(getSessionCookie(), token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 7 * 24 * 60 * 60
	});
}

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) redirect(302, '/');
	return { moodleEnabled: getMoodleConfig().enabled };
};

export const actions: Actions = {
	sibk: async ({ request, cookies }) => {
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

		setAuthCookie(cookies, user.id);
		redirect(302, '/');
	},

	moodle: async ({ request, cookies }) => {
		const config = getMoodleConfig();
		if (!config.enabled) {
			return fail(400, { error: 'Login dengan akun Moodle belum diaktifkan oleh admin.' });
		}

		const form = await request.formData();
		const username = String(form.get('username') ?? '').trim();
		const password = String(form.get('password') ?? '');

		if (username.length < 2 || username.length > 100 || !password || password.length > 256) {
			return fail(400, { error: 'Username atau password Moodle tidak valid.', errorTab: 'moodle' });
		}

		const result = await verifyMoodleLogin(config, username, password);

		if (!result.ok) {
			if (result.reason === 'invalid') {
				return fail(400, { error: 'Username atau password Moodle salah.', errorTab: 'moodle' });
			}
			return fail(400, {
				error: 'Tidak dapat menghubungi server Moodle. Periksa konfigurasi atau hubungi admin.',
				errorTab: 'moodle'
			});
		}

		const user = findOrCreateSiswaByUsername(result.username, result.fullname);
		setAuthCookie(cookies, user.id);
		redirect(302, '/');
	}
};