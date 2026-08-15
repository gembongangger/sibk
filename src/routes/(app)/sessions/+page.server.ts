import { fail, redirect } from '@sveltejs/kit';
import { db, listOpenRequests, listSessions } from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	const user = locals.user!;
	if (user.role !== 'guru' && user.role !== 'admin') {
		redirect(302, '/');
	}
	return {
		sessions: listSessions(),
		openRequests: listOpenRequests()
	};
};

export const actions: Actions = {
	catat: async ({ locals, request }) => {
		const user = locals.user!;
		if (user.role !== 'guru' && user.role !== 'admin') {
			return fail(403, { error: 'Tidak diizinkan.' });
		}
		const form = await request.formData();
		const requestId = Number(form.get('request_id') ?? 0);
		const siswaId = Number(form.get('siswa_id') ?? 0);
		const tanggal = String(form.get('tanggal') ?? '').trim();
		const tempat = String(form.get('tempat') ?? '').trim();
		const catatan = String(form.get('catatan') ?? '').trim();
		const tindakLanjut = String(form.get('tindak_lanjut') ?? '').trim();

		if (!requestId || !siswaId || !tanggal || !tempat || !catatan) {
			return fail(400, { error: 'Semua bidang wajib diisi untuk mencatat sesi.' });
		}

		const tx = db().transaction(() => {
			db()
				.prepare(
					`INSERT INTO counseling_sessions (request_id, siswa_id, guru_id, tanggal, tempat, catatan, tindak_lanjut)
					 VALUES (?, ?, ?, ?, ?, ?, ?)`
				)
				.run(requestId, siswaId, user.id, tanggal, tempat, catatan, tindakLanjut || null);
			db()
				.prepare(`UPDATE counseling_requests SET status = 'selesai' WHERE id = ?`)
				.run(requestId);
		});
		tx();

		return { success: 'Sesi konseling berhasil dicatat.' };
	}
};
