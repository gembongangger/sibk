export const STATUS_STYLE: Record<string, string> = {
	menunggu: 'bg-amber-50 text-amber-700',
	dijadwalkan: 'bg-sky-50 text-sky-700',
	selesai: 'bg-emerald-50 text-emerald-700',
	ditolak: 'bg-rose-50 text-rose-700'
};

export const ROLE_STYLE: Record<string, string> = {
	admin: 'bg-slate-900 text-white',
	guru: 'bg-primary-100 text-primary-800',
	siswa: 'bg-emerald-50 text-emerald-700'
};

export const STATUS_LABEL: Record<string, string> = {
	menunggu: 'Menunggu',
	dijadwalkan: 'Dijadwalkan',
	selesai: 'Selesai',
	ditolak: 'Ditolak'
};

export function formatDateTime(value: string | null | undefined): string {
	if (!value) return '-';
	const d = new Date(value);
	if (isNaN(d.getTime())) return value;
	return d.toLocaleString('id-ID', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

export function formatDate(value: string | null | undefined): string {
	if (!value) return '-';
	const d = new Date(value);
	if (isNaN(d.getTime())) return value;
	return d.toLocaleDateString('id-ID', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	});
}

export function formatTime(value: string | null | undefined): string {
	if (!value) return '-';
	const d = new Date(value);
	if (isNaN(d.getTime())) return value;
	return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export function toDateTimeLocal(value: string | null | undefined): string {
	if (!value) return '';
	const d = new Date(value);
	if (isNaN(d.getTime())) return '';
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
