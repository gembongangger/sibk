import { fail, redirect } from '@sveltejs/kit';
import { getSetting, setSetting } from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	const user = locals.user!;
	if (user.role !== 'admin') {
		redirect(302, '/');
	}
	const stored = getSetting('class_names');
	let classNames: string[] = [];
	if (stored) {
		try {
			const parsed = JSON.parse(stored);
			if (Array.isArray(parsed)) classNames = parsed;
		} catch { /* empty */ }
	}
	return {
		duration: Number(getSetting('session_duration_minutes') ?? '30'),
		classNames
	};
};

export const actions: Actions = {
	simpanDurasi: async ({ locals, request }) => {
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
	},

	simpanKelas: async ({ locals, request }) => {
		const user = locals.user!;
		if (user.role !== 'admin') {
			return fail(403, { error: 'Tidak diizinkan.' });
		}
		const form = await request.formData();
		const raw = String(form.get('classNames') ?? '').trim();

		const names = raw
			.split('\n')
			.map((s) => s.trim())
			.filter((s) => s.length > 0);

		if (names.length === 0) {
			return fail(400, { error: 'Masukkan minimal satu nama kelas.' });
		}

		setSetting('class_names', JSON.stringify(names));
		return { success: 'Daftar kelas berhasil disimpan.' };
	}
};
