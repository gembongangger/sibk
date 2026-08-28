import { fail, redirect } from '@sveltejs/kit';
import { createUser, listKelasConfig, parseAngkatan, getAngkatanAktif } from '$lib/server/db';
import { hashPassword, createSession, getSessionCookie } from '$lib/server/auth';
import { findUserByUsername } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) redirect(302, '/');
	return {
		kelasConfig: listKelasConfig(),
		angkatanOptions: getAngkatanAktif().years
	};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const nama = String(form.get('nama') ?? '').trim();
		const username = String(form.get('username') ?? '').trim();
		const password = String(form.get('password') ?? '');
		const nis = String(form.get('nis') ?? '').trim();
		const kelasTingkat = String(form.get('kelas_tingkat') ?? '').trim();
		const kelasProgram = String(form.get('kelas_program') ?? '').trim();
		const kelasNomor = String(form.get('kelas_nomor') ?? '').trim();
		const angkatan = parseAngkatan(String(form.get('angkatan') ?? '').trim());
		const email = String(form.get('email') ?? '').trim();
		const telepon = String(form.get('telepon') ?? '').trim();

		const formValues = { nama, username, nis, kelasTingkat, kelasProgram, kelasNomor, angkatan: angkatan ?? null, email, telepon };

		if (!nama) {
			return fail(400, { error: 'Nama lengkap wajib diisi.', form: formValues });
		}
		if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(username)) {
			return fail(400, {
				error: 'Username minimal 3 karakter, hanya huruf, angka, titik, garis bawah, atau strip.',
				form: formValues
			});
		}
		if (password.length < 6) {
			return fail(400, { error: 'Password minimal 6 karakter.', form: formValues });
		}
		if (findUserByUsername(username)) {
			return fail(400, { error: 'Username sudah digunakan. Pilih username lain.', form: formValues });
		}
		if (!kelasTingkat || !kelasProgram || !kelasNomor) {
			return fail(400, { error: 'Pilih kelas (tingkat, program, dan nomor) terlebih dahulu.', form: formValues });
		}

		const passwordHash = hashPassword(password);
		let userId: number;
		try {
			userId = createUser({
				nama,
				username,
				passwordHash,
				role: 'siswa',
				nis,
				kelasTingkat,
				kelasProgram,
				kelasNomor,
				angkatan: angkatan ?? undefined,
				email,
				telepon
			});
		} catch {
			return fail(500, { error: 'Gagal membuat akun. Coba lagi.', form: formValues });
		}

		const token = createSession(userId);
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