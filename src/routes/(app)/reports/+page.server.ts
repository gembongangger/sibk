import { redirect } from '@sveltejs/kit';
import { getFeedbackStats, listKelasOptions, listSessionsByPeriod } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	const user = locals.user!;
	if (user.role !== 'guru' && user.role !== 'admin') {
		redirect(302, '/');
	}

	const now = new Date();
	const y = now.getFullYear();
	const m = now.getMonth();

	const awal = url.searchParams.get('awal') ?? '';
	const akhir = url.searchParams.get('akhir') ?? '';
	const kelas = url.searchParams.get('kelas')?.trim() ?? '';
	const nama = url.searchParams.get('nama')?.trim() ?? '';
	const nis = url.searchParams.get('nis')?.trim() ?? '';

	const defaultAwal = `${y}-${String(m + 1).padStart(2, '0')}-01`;
	const defaultAkhir = `${y}-${String(m + 1).padStart(2, '0')}-${String(new Date(y, m + 1, 0).getDate()).padStart(2, '0')}`;

	const dateAwal = awal || defaultAwal;
	const dateAkhir = akhir || defaultAkhir;

	if (!/^\d{4}-\d{2}-\d{2}$/.test(dateAwal) || !/^\d{4}-\d{2}-\d{2}$/.test(dateAkhir)) {
		return { error: 'Periode laporan tidak valid.', awal: defaultAwal, akhir: defaultAkhir, kelas, nama, nis, kelasOptions: listKelasOptions(), sessions: [], feedbackStats: { total: 0, average: null } };
	}

	const filter = { kelas, nama, nis };

	return {
		awal: dateAwal,
		akhir: dateAkhir,
		kelas,
		nama,
		nis,
		kelasOptions: listKelasOptions(),
		sessions: listSessionsByPeriod(dateAwal, dateAkhir, filter),
		feedbackStats: getFeedbackStats(dateAwal, dateAkhir, filter),
		error: null
	};
};
