import { fail, redirect } from '@sveltejs/kit';
import { getSetting, setSetting } from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	const user = locals.user!;
	if (user.role !== 'admin') {
		redirect(302, '/');
	}
	return {
		duration: Number(getSetting('session_duration_minutes') ?? '30')
	};
};

export const actions: Actions = {
	simpan: async ({ locals, request }) => {
		const user = locals.user!;
		if (user.role !== 'admin') {
			return fail(403, { error: 'Tidak diizinkan.' });
		}
		const form = await request.formData();
		const duration = Number(form.get('duration') ?? 30);

		if (![15, 20, 30, 45, 60].includes(duration)) {
			return fail(400, { error: 'Durasi harus salah satu dari: 15, 20, 30, 45, atau 60 menit.' });
		}

		setSetting('session_duration_minutes', String(duration));
		return { success: 'Pengaturan durasi sesi berhasil disimpan.' };
	}
};
