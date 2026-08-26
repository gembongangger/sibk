/**
 * Reset password akun admin (admin pertama di tabel users).
 *
 * Jalankan:
 *   npm run reset-admin -- passwordBaru   → set password tertentu
 *   npm run reset-admin                   → kembali ke admin123
 *
 * Semua sesi aktif admin tersebut ikut dihapus agar harus login ulang.
 */
import { db } from '../src/lib/server/db.ts';
import { hashPassword, destroyAllUserSessions } from '../src/lib/server/auth.ts';

const password = String(process.argv[2] ?? '').trim() || 'admin123';

const admin = db()
	.prepare(`SELECT id, username, nama FROM users WHERE role = 'admin' ORDER BY id LIMIT 1`)
	.get() as { id: number; username: string; nama: string } | undefined;

if (!admin) {
	console.error('GAGAL: tidak ada akun admin di database.');
	process.exit(1);
}

db().prepare('UPDATE users SET password = ? WHERE id = ?').run(hashPassword(password), admin.id);
destroyAllUserSessions(admin.id);

console.log('Password admin berhasil direset.');
console.log(`  Nama     : ${admin.nama}`);
console.log(`  Username : ${admin.username}`);
console.log(`  Password : ${password}`);
console.log('Semua sesi login lama admin telah dikeluarkan. Silakan login ulang.');
