import { fail, redirect } from '@sveltejs/kit';
import {
	getKelasTingkatOptions,
	getKelasProgramOptions,
	getKelasNomorOptions,
	getSetting,
	setSetting
} from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';

function parseLines(raw: string): string[] {
	return raw
		.split('\n')
		.map((s) => s.trim())
		.filter((s) => s.length > 0);
}

export const load: PageServerLoad = ({ locals }) => {
	const user = locals.user!;
	if (user.role !== 'admin') {
		redirect(302, '/');
	}
	return {
		duration: Number(getSetting('session_duration_minutes') ?? '30'),
		tingkatOptions: getKelasTingkatOptions(),
		programOptions: getKelasProgramOptions(),
		nomorOptions: getKelasNomorOptions()
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
		const tingkat = parseLines(String(form.get('tingkatOptions') ?? ''));
		const program = parseLines(String(form.get('programOptions') ?? ''));
		const nomor = parseLines(String(form.get('nomorOptions') ?? ''));

		if (tingkat.length === 0 || program.length === 0 || nomor.length === 0) {
			return fail(400, { error: 'Semua daftar (tingkat, program, nomor) minimal satu item.' });
		}

		setSetting('kelas_tingkat_options', JSON.stringify(tingkat));
		setSetting('kelas_program_options', JSON.stringify(program));
		setSetting('kelas_nomor_options', JSON.stringify(nomor));
		return { success: 'Daftar opsi kelas berhasil disimpan.' };
	}
};