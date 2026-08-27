import { fail } from '@sveltejs/kit';
import { db, getUserById, listKelasOptions, listSessionsForSiswa } from '$lib/server/db';
import { hashPassword } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	const user = locals.user!;
	const current = getUserById(user.id) ?? user;
	return {
		user: current,
		riwayat: current.role === 'siswa' ? listSessionsForSiswa(current.id) : [],
		classNames: listKelasOptions()
	};
};

export const actions: Actions = {
	simpan: async ({ locals, request }) => {
		const current = locals.user!;
		const form = await request.formData();
		const nama = String(form.get('nama') ?? '').trim();
		const email = String(form.get('email') ?? '').trim();
		const telepon = String(form.get('telepon') ?? '').trim();
		const kelas = String(form.get('kelas') ?? '').trim();
		const nis = String(form.get('nis') ?? '').trim();
		const password = String(form.get('password') ?? '');

		if (!nama) {
			return fail(400, { error: 'Nama tidak boleh kosong.' });
		}

		if (password) {
			db()
				.prepare(
					`UPDATE users SET nama = ?, email = ?, telepon = ?, kelas = ?, nis = ?, password = ?
					 WHERE id = ?`
				)
				.run(nama, email || null, telepon || null, kelas || null, nis || null, hashPassword(password), current.id);
		} else {
			db()
				.prepare(
					`UPDATE users SET nama = ?, email = ?, telepon = ?, kelas = ?, nis = ?
					 WHERE id = ?`
				)
				.run(nama, email || null, telepon || null, kelas || null, nis || null, current.id);
		}

		return { success: 'Profil berhasil diperbarui.' };
	}
};
