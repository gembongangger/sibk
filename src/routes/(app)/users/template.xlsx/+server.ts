import ExcelJS from 'exceljs';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (locals.user?.role !== 'admin') {
		redirect(302, '/');
	}

	const wb = new ExcelJS.Workbook();

	const ws = wb.addWorksheet('Siswa');
	const cols = ['Nama', 'Username', 'Role', 'NIS', 'Kelas', 'Angkatan', 'Email', 'Telepon', 'Password'];
	ws.columns = cols.map((h) => ({
		header: h,
		key: h,
		width: h === 'Email' ? 30 : h === 'Nama' || h === 'Username' ? 24 : 16
	}));
	const header = ws.getRow(1);
	header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
	header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F855A' } };
	header.alignment = { vertical: 'middle' };
	header.height = 22;

	ws.addRow([
		'Contoh Nama Siswa',
		'contoh_siswa',
		'siswa',
		'211100',
		'X IPA 1',
		2024,
		'contoh@madrasah.sch.id',
		'081234567890',
		'123456'
	]);

	const petunjuk = wb.addWorksheet('Petunjuk');
	petunjuk.columns = [{ width: 110 }];
	const lines = [
		'PETUNJUK IMPORT DATA MASSAL (EXCEL)',
		'',
		'1. Isi data pada sheet "Siswa" mulai baris ke-2 (baris ke-1 adalah judul kolom).',
		'2. Kolom wajib: Nama, Username, Role. Kolom lainnya opsional.',
		'3. Nilai Role: siswa, guru, atau admin. Jika dikosongkan akan dianggap siswa.',
		'4. Kolom Angkatan berisi tahun masuk siswa (contoh: 2024). Khusus untuk role siswa.',
		'5. Jika Password dikosongkan, password otomatis menjadi 123456.',
		'6. Baris contoh di baris ke-2 boleh dihapus sebelum mengupload.',
		'7. Username yang sudah terdaftar akan dilewati (tidak diduplikasi).',
		'',
		'Simpan file dalam format .xlsx lalu upload lewat menu Pengguna > Import Data Massal.'
	];
	lines.forEach((l) => petunjuk.addRow([l]));
	petunjuk.getRow(1).font = { bold: true, size: 12 };

	const buffer = await wb.xlsx.writeBuffer();
	return new Response(buffer as unknown as BodyInit, {
		headers: {
			'Content-Type':
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': 'attachment; filename="template-import-siswa.xlsx"'
		}
	});
};
