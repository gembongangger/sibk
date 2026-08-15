/**
 * Seed akun demo (guru BK & siswa) ke database SQLite.
 *
 * Jalankan:  npm run seed:demo
 * Database akan dibuat otomatis bila belum ada (termasuk akun admin default).
 * Kredensial demo ditulis ke file demo-accounts.txt di root proyek.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '../src/lib/server/db.ts';
import { hashPassword } from '../src/lib/server/auth.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

interface DemoUser {
	username: string;
	password: string;
	nama: string;
	role: 'guru' | 'siswa';
	nis?: string;
	kelas?: string;
	email?: string;
}

const demoUsers: DemoUser[] = [
	// Guru BK
	{ username: 'ahmad_yusuf', password: 'guru123', nama: 'Ahmad Yusuf, S.Psi.', role: 'guru', email: 'ahmad@man1jember.sch.id' },
	{ username: 'siti_nurhaliza', password: 'guru123', nama: 'Siti Nurhaliza, S.Pd.', role: 'guru', email: 'siti@man1jember.sch.id' },
	{ username: 'rahmad_hidayat', password: 'guru123', nama: 'Rahmad Hidayat, S.Pd.', role: 'guru', email: 'rahmad@man1jember.sch.id' },

	// Siswa
	{ username: 'ani_putri', password: 'siswa123', nama: 'Ani Putri Lestari', role: 'siswa', nis: '211001', kelas: 'X IPA 1', email: 'ani.putri@student.sch.id' },
	{ username: 'bagas_prakoso', password: 'siswa123', nama: 'Bagas Prakoso', role: 'siswa', nis: '211002', kelas: 'X IPA 1', email: 'bagas@student.sch.id' },
	{ username: 'citra_dewi', password: 'siswa123', nama: 'Citra Dewi Anggraini', role: 'siswa', nis: '212001', kelas: 'XI IPA 2', email: 'citra.dewi@student.sch.id' },
	{ username: 'dimas_aryo', password: 'siswa123', nama: 'Dimas Aryo Nugroho', role: 'siswa', nis: '212002', kelas: 'XI IPS 1', email: 'dimas.aryo@student.sch.id' },
	{ username: 'erlina_sari', password: 'siswa123', nama: 'Erlina Sari', role: 'siswa', nis: '213001', kelas: 'XII IPA 3', email: 'erlina.sari@student.sch.id' }
];

const insert = db().prepare(
	`INSERT INTO users (username, password, nama, role, nis, kelas, email)
	 VALUES (?, ?, ?, ?, ?, ?, ?)
	 ON CONFLICT(username) DO UPDATE SET
	   nama = excluded.nama,
	   role = excluded.role,
	   nis  = excluded.nis,
	   kelas = excluded.kelas,
	   email = excluded.email,
	   password = excluded.password`
);

let created = 0;
for (const u of demoUsers) {
	insert.run(u.username, hashPassword(u.password), u.nama, u.role, u.nis ?? null, u.kelas ?? null, u.email ?? null);
	created++;
}

const lines: string[] = [];
lines.push('='.repeat(58));
lines.push('  AKUN DEMO — SISTEM BK MAN 1 JEMBER (SvelteKit + SQLite)');
lines.push('='.repeat(58));
lines.push('');
lines.push('  URL aplikasi : http://localhost:5173');
lines.push('  Database     : data/bk.sqlite (dibuat otomatis saat pertama dijalankan)');
lines.push('');
lines.push('  ADMIN (dibuat otomatis oleh sistem):');
lines.push('    username : admin');
lines.push('    password : admin123');
lines.push('    role     : admin');
lines.push('');
lines.push('  GURU BK (password sama: guru123):');
lines.push('    ---------------------------------------');
for (const u of demoUsers.filter((u) => u.role === 'guru')) {
	lines.push(`    username : ${u.username}`);
	lines.push(`    password : ${u.password}`);
	lines.push(`    nama     : ${u.nama}`);
	lines.push('    ---------------------------------------');
}
lines.push('');
lines.push('  SISWA (password sama: siswa123):');
lines.push('    ---------------------------------------');
for (const u of demoUsers.filter((u) => u.role === 'siswa')) {
	lines.push(`    username : ${u.username}`);
	lines.push(`    password : ${u.password}`);
	lines.push(`    nama     : ${u.nama}  (NIS ${u.nis} - ${u.kelas})`);
	lines.push('    ---------------------------------------');
}
lines.push('');
lines.push('  Tips: import massal siswa lain juga bisa via menu Pengguna > Import CSV.');
lines.push('='.repeat(58));

const filePath = path.join(ROOT, 'demo-accounts.txt');
fs.writeFileSync(filePath, lines.join('\n') + '\n');

console.log(lines.join('\n'));
console.log(`\n✔ ${created} akun demo siap. Kredensial tersimpan di: demo-accounts.txt`);
