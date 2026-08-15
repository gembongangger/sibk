import { error, redirect } from '@sveltejs/kit';
import { getUserById, listSessionsForSiswa } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = locals.user!;
	if (user.role !== 'guru' && user.role !== 'admin') {
		redirect(302, '/');
	}
	const siswa = getUserById(Number(params.id));
	if (!siswa || siswa.role !== 'siswa') {
		error(404, 'Siswa tidak ditemukan.');
	}
	return {
		siswa,
		riwayat: listSessionsForSiswa(siswa.id)
	};
};
