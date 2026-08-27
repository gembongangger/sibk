import { json } from '@sveltejs/kit';
import { suggestAvailableSlots } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const guruId = Number(url.searchParams.get('guruId') ?? 0);
	const date = url.searchParams.get('date') ?? '';

	if (!guruId || !date) {
		return json({ error: 'guruId dan date wajib diisi' }, { status: 400 });
	}

	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		return json({ error: 'Format date harus YYYY-MM-DD' }, { status: 400 });
	}

	const slots = suggestAvailableSlots(guruId, date);
	return json({ slots });
};
