import ExcelJS from 'exceljs';
import { fail, redirect } from '@sveltejs/kit';
import {
	db,
	buildKelasString,
	getAngkatanAktif,
	getUserById,
	listAngkatanOptions,
	listKelasConfig,
	listUsers,
	parseAngkatan,
	setAngkatanAktif
} from '$lib/server/db';
import { hashPassword } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

const ROLES = ['admin', 'guru', 'siswa'];

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = locals.user!;
	if (user.role !== 'admin') {
		redirect(302, '/');
	}
	const editId = Number(url.searchParams.get('edit') ?? 0);
	const q = url.searchParams.get('q') ?? '';
	const rawPage = Number(url.searchParams.get('page') ?? 1);
	const angkatan = parseAngkatan(url.searchParams.get('angkatan') ?? '');
	const statusRaw = url.searchParams.get('status') ?? '';
	const status = statusRaw === 'aktif' || statusRaw === 'nonaktif' ? statusRaw : '';

	const aktif = getAngkatanAktif();
	const list = listUsers({
		search: q,
		page: Number.isFinite(rawPage) ? rawPage : 1,
		pageSize: 10,
		angkatan: angkatan ?? undefined,
		status: (status || undefined) as 'aktif' | 'nonaktif' | undefined,
		activeAngkatan: aktif.years
	});
	return {
		users: list.users,
		total: list.total,
		page: list.page,
		totalPages: list.totalPages,
		q,
		angkatan,
		status,
		angkatanOptions: listAngkatanOptions(),
		angkatanAktif: aktif.years,
		angkatanDikonfigurasi: aktif.configured,
		editUser: editId > 0 ? getUserById(editId) : null,
		kelasConfig: listKelasConfig()
	};
};

export const actions: Actions = {
	simpan: async ({ request }) => {
		const form = await request.formData();
		const id = Number(form.get('id') ?? 0);
		const nama = String(form.get('nama') ?? '').trim();
		const username = String(form.get('username') ?? '').trim();
		const role = String(form.get('role') ?? 'siswa');
		const password = String(form.get('password') ?? '');
		const nis = String(form.get('nis') ?? '').trim();
		const kelasTingkat = String(form.get('kelas_tingkat') ?? '').trim();
		const kelasProgram = String(form.get('kelas_program') ?? '').trim();
		const kelasNomor = String(form.get('kelas_nomor') ?? '').trim();
		let kelas = buildKelasString(kelasTingkat, kelasProgram, kelasNomor);
		const angkatan = parseAngkatan(String(form.get('angkatan') ?? '').trim());
		const email = String(form.get('email') ?? '').trim();
		const telepon = String(form.get('telepon') ?? '').trim();

		if (!nama || !username || !ROLES.includes(role)) {
			return fail(400, { error: 'Nama, username, dan peran wajib diisi.' });
		}

		if (!kelas && id > 0) {
			kelas = getUserById(id)?.kelas ?? null;
		}

		try {
			if (id > 0) {
				if (password) {
					db()
						.prepare(
							`UPDATE users SET nama = ?, username = ?, role = ?, nis = ?, kelas = ?, kelas_tingkat = ?, kelas_program = ?, kelas_nomor = ?, angkatan = ?, email = ?, telepon = ?, password = ?
							 WHERE id = ?`
						)
						.run(nama, username, role, nis || null, kelas, kelasTingkat || null, kelasProgram || null, kelasNomor || null, angkatan, email || null, telepon || null, hashPassword(password), id);
				} else {
					db()
						.prepare(
							`UPDATE users SET nama = ?, username = ?, role = ?, nis = ?, kelas = ?, kelas_tingkat = ?, kelas_program = ?, kelas_nomor = ?, angkatan = ?, email = ?, telepon = ?
							 WHERE id = ?`
						)
						.run(nama, username, role, nis || null, kelas, kelasTingkat || null, kelasProgram || null, kelasNomor || null, angkatan, email || null, telepon || null, id);
				}
				return { success: 'Data pengguna berhasil diperbarui.' };
			}

			if (!password) {
				return fail(400, { error: 'Password wajib diisi untuk pengguna baru.' });
			}
			db()
				.prepare(
					`INSERT INTO users (nama, username, role, nis, kelas, kelas_tingkat, kelas_program, kelas_nomor, angkatan, email, telepon, password)
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
				)
				.run(nama, username, role, nis || null, kelas, kelasTingkat || null, kelasProgram || null, kelasNomor || null, angkatan, email || null, telepon || null, hashPassword(password));
			return { success: 'Pengguna baru berhasil ditambahkan.' };
		} catch {
			return fail(500, { error: 'Terjadi kesalahan saat menyimpan data pengguna.' });
		}
	},

	angkatan: async ({ request }) => {
		const form = await request.formData();
		const years = form
			.getAll('tahun')
			.map((v) => Number(v))
			.filter((n) => Number.isInteger(n) && n >= 1990 && n <= 2100);
		const baru = parseAngkatan(String(form.get('tahun_baru') ?? '').trim());
		if (baru !== null) years.push(baru);
		setAngkatanAktif(years);
		return { success: `Pengaturan tahun angkatan aktif disimpan (${years.length} tahun).` };
	},

	hapus: async ({ request }) => {
		const form = await request.formData();
		const id = Number(form.get('id') ?? 0);
		if (!id) {
			return fail(400, { error: 'Data tidak valid.' });
		}
		db()
			.prepare(`DELETE FROM users WHERE id = ? AND role != 'admin'`)
			.run(id);
		return { success: 'Pengguna berhasil dihapus.' };
	},

	import: async ({ request }) => {
		const form = await request.formData();
		const file = form.get('file');
		console.log(
			'[import] content-type:', request.headers.get('content-type'),
			'| field:', [...form.keys()].join(', '),
			'| file:', file instanceof File ? `${file.name} (${file.size} bytes)` : `STRING -> ${String(file)}`
		);

		if (!(file instanceof File) || file.size === 0) {
			console.error('[import] GAGAL: file tidak ada atau kosong (mungkin terkirim sebagai string, bukan multipart).');
			return fail(400, {
				error: 'File tidak terkirim dengan benar. Pilih ulang file di kolom upload, lalu klik Import. Jika masih gagal, muat ulang halaman (Ctrl+Shift+R) dan coba lagi.'
			});
		}

		const name = file.name.toLowerCase();
		let rows: string[][];
		try {
			if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
				rows = await parseXlsx(await file.arrayBuffer());
			} else {
				console.error('[import] GAGAL: ekstensi tidak dikenali:', name);
				return fail(400, { error: 'Format file harus berupa .xlsx. Gunakan template Excel yang diunduh.' });
			}
		} catch (e) {
			console.error('[import] GAGAL parse file:', (e as Error).message);
			return fail(400, {
				error:
					'File Excel tidak dapat dibaca. Pastikan berformat .xlsx (simpan ulang di Excel: File > Save As > Excel Workbook (.xlsx)), atau unduh ulang template lalu isi datanya.'
			});
		}

		const headerIdx = rows.findIndex((r) => r.some((c) => c.toLowerCase().trim() === 'nama'));
		if (headerIdx === -1) {
			return fail(400, {
				error: 'Kolom "Nama" tidak ditemukan di baris pertama. Gunakan template yang diunduh, atau pastikan judul kolom berada di baris pertama (Nama; Username; Role).'
			});
		}

		const header = rows[headerIdx].map((h) => h.toLowerCase().trim());
		const map: Record<string, number> = {};
		header.forEach((name, index) => (map[name] = index));
		rows = rows.slice(headerIdx + 1);

		if (rows.length === 0) {
			console.error('[import] GAGAL: tidak ada baris data (baris header ditemukan, data kosong).');
			return fail(400, {
				error: 'File tidak berisi baris data. Isi minimal satu baris data di bawah judul kolom.'
			});
		}

		const missing = ['nama', 'username', 'role'].filter((c) => !(c in map));
		if (missing.length) {
			console.error('[import] GAGAL: kolom wajib hilang:', missing.join(', '));
			return fail(400, { error: 'Kolom wajib berikut belum ada di file: ' + missing.join(', ') + '.' });
		}

		const stmtCheck = db().prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
		const stmtInsert = db().prepare(
			`INSERT INTO users (nama, username, role, nis, kelas, kelas_tingkat, kelas_program, kelas_nomor, angkatan, email, telepon, password)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		);

		let inserted = 0;
		let skipped = 0;
		const tx = db().transaction(() => {
			for (let i = 0; i < rows.length; i++) {
				const row = rows[i];
				const get = (key: string) => {
					const idx = map[key];
					return idx === undefined ? '' : String(row[idx] ?? '').trim();
				};

				const nama = get('nama');
				const username = get('username');
				if (!nama || !username) {
					skipped++;
					continue;
				}
				let role = get('role').toLowerCase();
				if (!ROLES.includes(role)) role = 'siswa';
				if (stmtCheck.get(username)) {
					skipped++;
					continue;
				}
				let kelasTingkat = get('kelas_tingkat') || get('tingkat');
				let kelasProgram = get('kelas_program') || get('program');
				let kelasNomor = get('kelas_nomor') || get('nomor');
				let kelas = buildKelasString(kelasTingkat, kelasProgram, kelasNomor);
				if (!kelas) {
					kelas = get('kelas') || null;
					const parts = splitKelas(kelas);
					kelasTingkat = parts.tingkat;
					kelasProgram = parts.program;
					kelasNomor = parts.nomor;
				}
				const password = get('password') || '123456';
				try {
					stmtInsert.run(
						nama,
						username,
						role,
						get('nis') || null,
						kelas,
						kelasTingkat || null,
						kelasProgram || null,
						kelasNomor || null,
						parseAngkatan(get('angkatan')),
						get('email') || null,
						get('telepon') || null,
						hashPassword(password)
					);
					inserted++;
				} catch {
					skipped++;
				}
			}
		});
		tx();

		if (inserted > 0) {
			return { success: `Import selesai. Berhasil: ${inserted} baris, dilewati: ${skipped} baris.` };
		}
		console.error('[import] GAGAL: 0 baris berhasil (semua dilewati). inserted=', inserted, 'skipped=', skipped);
		return fail(400, {
			error:
				'Semua baris dilewati — tidak ada data baru yang ditambahkan (username sudah terdaftar, atau baris berisi nama/username kosong).'
		});
	}
};

function splitKelas(kelas: string | null): { tingkat: string; program: string; nomor: string } {
	if (!kelas) return { tingkat: '', program: '', nomor: '' };
	const parts = kelas.trim().split(/\s+/);
	return {
		tingkat: parts[0] ?? '',
		program: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
		nomor: parts[parts.length - 1] ?? ''
	};
}

async function parseXlsx(buffer: ArrayBuffer): Promise<string[][]> {
	const wb = new ExcelJS.Workbook();
	await wb.xlsx.load(buffer);
	const sheet = wb.worksheets[0];
	if (!sheet) return [];
	const rows: string[][] = [];
	sheet.eachRow((row) => {
		const values = row.values as unknown[];
		const cells = values
			.slice(1)
			.map((v) =>
				v instanceof Date
					? v.toISOString().slice(0, 10)
					: v == null
						? ''
						: String(v).trim()
			);
		rows.push(cells);
	});
	return rows.filter((r) => r.some((f) => f !== ''));
}
