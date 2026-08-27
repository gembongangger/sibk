import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	countByRole,
	countPendingRequests,
	countUpcomingSessions,
	pendingFeedbackForSiswa,
	recentRequests,
	updateRequestStatus
} from '$lib/server/db';

const STATUSES = ['menunggu', 'dijadwalkan', 'selesai', 'ditolak'];

export const load: PageServerLoad = ({ locals }) => {
	const user = locals.user!;
	const isStaff = user.role === 'admin' || user.role === 'guru';
	const guruId = user.role === 'guru' ? user.id : undefined;
	return {
		totalSiswa: user.role === 'admin' ? countByRole('siswa') : 0,
		totalGuru: user.role === 'admin' ? countByRole('guru') : 0,
		totalPending: countPendingRequests(guruId),
		totalUpcoming: countUpcomingSessions(guruId),
		recentRequests: isStaff ? recentRequests(5, guruId) : [],
		pendingFeedback: user.role === 'siswa' ? pendingFeedbackForSiswa(user.id) : []
	};
};

export const actions: Actions = {
	kelola: async ({ locals, request }) => {
		const user = locals.user!;
		if (user.role !== 'guru' && user.role !== 'admin') {
			return fail(403, { error: 'Tidak diizinkan.' });
		}
		const form = await request.formData();
		const id = Number(form.get('id') ?? 0);
		const status = String(form.get('status') ?? 'menunggu');
		const jadwal = String(form.get('jadwal') ?? '').trim();

		if (!id || !STATUSES.includes(status)) {
			return fail(400, { error: 'Data permohonan tidak valid.' });
		}

		updateRequestStatus(id, status, jadwal, user.id);

		return { success: 'Permohonan konseling berhasil diperbarui.' };
	}
};
