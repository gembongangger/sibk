import { fail } from '@sveltejs/kit';
import {
	db,
	checkGuruAvailability,
	normalizeJadwal,
	listAllRequests,
	listGuruBK,
	listRequestsForSiswa,
	suggestAvailableSlots,
	updateRequestStatus,
	type StudentRequestRow
} from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	const user = locals.user!;
	const isGuru = user.role === 'guru' || user.role === 'admin';
	return {
		isGuru,
		requests: (isGuru ? listAllRequests() : listRequestsForSiswa(user.id)) as StudentRequestRow[],
		guruList: listGuruBK()
	};
};

export const actions: Actions = {
	ajukan: async ({ locals, request }) => {
		const user = locals.user!;
		if (user.role !== 'siswa') {
			return fail(403, { error: 'Tidak diizinkan.' });
		}
		const form = await request.formData();
		const jenis = String(form.get('jenis') ?? '').trim();
		const topik = String(form.get('topik') ?? '').trim();
		const deskripsi = String(form.get('deskripsi') ?? '').trim();
		const jadwal = String(form.get('jadwal') ?? '').trim();
		const guruId = Number(form.get('guru_id') ?? 0);

		if (!jenis || !topik || !deskripsi) {
			return fail(400, {
				error: 'Semua bidang wajib diisi untuk pengajuan konseling.',
				form: { jenis, topik, deskripsi }
			});
		}

		if (!guruId) {
			return fail(400, {
				error: 'Pilih guru BK yang akan membimbing Anda.',
				form: { jenis, topik, deskripsi }
			});
		}

		if (jadwal) {
			const check = checkGuruAvailability(guruId, jadwal);
			if (!check.available) {
				const dateOnly = jadwal.slice(0, 10);
				const availableSlots = suggestAvailableSlots(guruId, dateOnly).filter((s) => s.available);
				return fail(400, {
					error: `Guru BK sudah tidak tersedia pada waktu tersebut. ${check.conflictDetail ?? ''}`,
					slotsConflict: true,
					availableSlots,
					form: { jenis, topik, deskripsi }
				});
			}
		}

		db()
			.prepare(
				`INSERT INTO counseling_requests (siswa_id, jenis, topik, deskripsi, jadwal, guru_id)
				 VALUES (?, ?, ?, ?, ?, ?)`
			)
			.run(user.id, jenis, topik, deskripsi, jadwal ? normalizeJadwal(jadwal) : null, guruId);

		return { success: 'Permohonan konseling berhasil dikirim.' };
	},

	kelola: async ({ locals, request }) => {
		const user = locals.user!;
		if (user.role !== 'guru' && user.role !== 'admin') {
			return fail(403, { error: 'Tidak diizinkan.' });
		}
		const form = await request.formData();
		const id = Number(form.get('id') ?? 0);
		const status = String(form.get('status') ?? 'menunggu');
		const jadwal = String(form.get('jadwal') ?? '').trim();

		if (!id || !['menunggu', 'dijadwalkan', 'selesai', 'ditolak'].includes(status)) {
			return fail(400, { error: 'Data permohonan tidak valid.' });
		}

		if (status === 'dijadwalkan' && jadwal) {
			const check = checkGuruAvailability(user.id, jadwal, id);
			if (!check.available) {
				const dateOnly = jadwal.slice(0, 10);
				const availableSlots = suggestAvailableSlots(user.id, dateOnly).filter((s) => s.available);
				return fail(400, {
					error: `Waktu sudah terpakai. ${check.conflictDetail ?? ''}`,
					slotsConflict: true,
					availableSlots
				});
			}
		}

		updateRequestStatus(id, status, jadwal, user.id);

		return { success: 'Permohonan konseling berhasil diperbarui.' };
	}
};
