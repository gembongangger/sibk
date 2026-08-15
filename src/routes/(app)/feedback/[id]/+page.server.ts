import { error, fail } from '@sveltejs/kit';
import {
	db,
	getFeedbackBySession,
	getSessionForFeedback,
	insertFeedback
} from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, params }) => {
	const user = locals.user!;
	const sessionId = Number(params.id);
	const session = getSessionForFeedback(sessionId);

	if (!session || session.siswa_id !== user.id) {
		error(404, 'Sesi tidak ditemukan.');
	}

	return {
		session,
		feedback: getFeedbackBySession(sessionId)
	};
};

export const actions: Actions = {
	kirim: async ({ locals, request, params }) => {
		const user = locals.user!;
		const sessionId = Number(params.id);
		const session = getSessionForFeedback(sessionId);

		if (!session || session.siswa_id !== user.id) {
			return fail(404, { error: 'Sesi tidak ditemukan.' });
		}
		if (getFeedbackBySession(sessionId)) {
			return fail(400, { error: 'Umpan balik untuk sesi ini sudah pernah dikirim.' });
		}

		const form = await request.formData();
		const rating = Number(form.get('rating') ?? 0);
		const refleksi = String(form.get('refleksi') ?? '').trim();

		if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
			return fail(400, { error: 'Silakan pilih tingkat kepuasan terlebih dahulu.' });
		}

		insertFeedback(sessionId, user.id, rating, refleksi || null);

		return { success: 'Terima kasih! Umpan balik Anda telah disimpan.' };
	}
};
