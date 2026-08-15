import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';

export type Role = 'admin' | 'guru' | 'siswa';
export type RequestStatus = 'menunggu' | 'dijadwalkan' | 'selesai' | 'ditolak';

export interface User {
	id: number;
	username: string;
	password: string;
	nama: string;
	role: Role;
	nis: string | null;
	kelas: string | null;
	email: string | null;
	telepon: string | null;
	created_at: string;
}

export interface RequestRow {
	id: number;
	siswa_id: number;
	guru_id: number | null;
	jenis: string;
	topik: string;
	deskripsi: string;
	status: RequestStatus;
	jadwal: string | null;
	created_at: string;
	nama_siswa?: string;
	nama_guru?: string | null;
}

export interface SessionRow {
	id: number;
	request_id: number;
	siswa_id: number;
	guru_id: number;
	tanggal: string;
	tempat: string;
	catatan: string;
	tindak_lanjut: string | null;
	created_at: string;
	jenis?: string;
	topik?: string;
	nama_siswa?: string;
	nama_guru?: string;
	feedback_rating?: number | null;
	feedback_refleksi?: string | null;
}

export interface FeedbackRow {
	id: number;
	session_id: number;
	siswa_id: number;
	rating: number;
	refleksi: string | null;
	created_at: string;
}

const DB_PATH =
	process.env.DATABASE_PATH ??
	path.join(process.cwd(), 'data', 'bk.sqlite');

let _db: Database.Database | null = null;

export function db(): Database.Database {
	if (_db) return _db;
	fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
	_db = new Database(DB_PATH);
	_db.pragma('journal_mode = WAL');
	_db.pragma('foreign_keys = ON');
	migrate(_db);
	return _db;
}

function migrate(d: Database.Database): void {
	d.exec(`
		CREATE TABLE IF NOT EXISTS sessions (
			token TEXT PRIMARY KEY,
			user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			created_at DATETIME NOT NULL DEFAULT (datetime('now', 'localtime')),
			expires_at DATETIME NOT NULL
		);

		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT NOT NULL UNIQUE,
			password TEXT NOT NULL,
			nama TEXT NOT NULL,
			role TEXT NOT NULL DEFAULT 'siswa' CHECK (role IN ('admin','guru','siswa')),
			nis TEXT,
			kelas TEXT,
			email TEXT,
			telepon TEXT,
			created_at DATETIME NOT NULL DEFAULT (datetime('now', 'localtime'))
		);

		CREATE TABLE IF NOT EXISTS counseling_requests (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			siswa_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			guru_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
			jenis TEXT NOT NULL,
			topik TEXT NOT NULL,
			deskripsi TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT 'menunggu' CHECK (status IN ('menunggu','dijadwalkan','selesai','ditolak')),
			jadwal DATETIME,
			created_at DATETIME NOT NULL DEFAULT (datetime('now', 'localtime'))
		);

		CREATE TABLE IF NOT EXISTS counseling_sessions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			request_id INTEGER NOT NULL REFERENCES counseling_requests(id) ON DELETE CASCADE,
			siswa_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			guru_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			tanggal DATETIME NOT NULL,
			tempat TEXT NOT NULL,
			catatan TEXT NOT NULL,
			tindak_lanjut TEXT,
			created_at DATETIME NOT NULL DEFAULT (datetime('now', 'localtime'))
		);

		CREATE TABLE IF NOT EXISTS session_feedback (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			session_id INTEGER NOT NULL REFERENCES counseling_sessions(id) ON DELETE CASCADE,
			siswa_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
			refleksi TEXT,
			created_at DATETIME NOT NULL DEFAULT (datetime('now', 'localtime')),
			UNIQUE (session_id, siswa_id)
		);

		CREATE INDEX IF NOT EXISTS idx_requests_status ON counseling_requests(status);
		CREATE INDEX IF NOT EXISTS idx_requests_jadwal ON counseling_requests(jadwal);
		CREATE INDEX IF NOT EXISTS idx_sessions_tanggal ON counseling_sessions(tanggal);
		CREATE INDEX IF NOT EXISTS idx_feedback_siswa ON session_feedback(siswa_id);
	`);
	ensure_default_admin(d);
}

export function countByRole(role: Role): number {
	const row = db()
		.prepare('SELECT COUNT(*) AS total FROM users WHERE role = ?')
		.get(role) as { total: number };
	return row.total;
}

export function countPendingRequests(): number {
	const row = db()
		.prepare(`SELECT COUNT(*) AS total FROM counseling_requests WHERE status = 'menunggu'`)
		.get() as { total: number };
	return row.total;
}

export function countUpcomingSessions(): number {
	const row = db()
		.prepare(
			`SELECT COUNT(*) AS total FROM counseling_requests
			 WHERE status = 'dijadwalkan' AND jadwal >= datetime('now', 'localtime')`
		)
		.get() as { total: number };
	return row.total;
}

export function recentRequests(limit = 5): RequestRow[] {
	return db()
		.prepare(
			`SELECT r.*, u.nama AS nama_siswa
			 FROM counseling_requests r
			 JOIN users u ON u.id = r.siswa_id
			 ORDER BY r.created_at DESC
			 LIMIT ?`
		)
		.all(limit) as RequestRow[];
}

export function updateRequestStatus(id: number, status: string, jadwal: string, guruId: number): void {
	const d = db();
	d.transaction(() => {
		const req = d.prepare('SELECT * FROM counseling_requests WHERE id = ?').get(id) as
			| { siswa_id: number }
			| undefined;
		d.prepare(
			`UPDATE counseling_requests SET status = ?, jadwal = ?, guru_id = ? WHERE id = ?`
		).run(status, jadwal || null, guruId, id);
		if (status === 'selesai' && req) {
			const adaSesi = d.prepare('SELECT id FROM counseling_sessions WHERE request_id = ? LIMIT 1').get(id);
			if (!adaSesi) {
				const tanggal =
					jadwal || (d.prepare("SELECT datetime('now','localtime') AS t").get() as { t: string }).t;
				d.prepare(
					`INSERT INTO counseling_sessions (request_id, siswa_id, guru_id, tanggal, tempat, catatan, tindak_lanjut)
					 VALUES (?, ?, ?, ?, ?, ?, ?)`
				).run(
					id,
					req.siswa_id,
					guruId,
					tanggal,
					'Ruang BK',
					'Permohonan ditutup melalui menu kelola (tanpa catatan sesi terperinci).',
					null
				);
			}
		}
	})();
}

export interface StudentRequestRow extends RequestRow {
	session_id: number | null;
	feedback_rating: number | null;
}

export function listRequestsForSiswa(siswaId: number): StudentRequestRow[] {
	return db()
		.prepare(
			`SELECT r.*, s.nama AS nama_siswa, g.nama AS nama_guru,
			        (SELECT cs.id FROM counseling_sessions cs
			         WHERE cs.request_id = r.id
			         ORDER BY cs.tanggal DESC LIMIT 1) AS session_id,
			        (SELECT f.rating FROM session_feedback f
			         JOIN counseling_sessions cs2 ON cs2.id = f.session_id
			         WHERE cs2.request_id = r.id
			         ORDER BY f.created_at DESC LIMIT 1) AS feedback_rating
			 FROM counseling_requests r
			 JOIN users s ON s.id = r.siswa_id
			 LEFT JOIN users g ON g.id = r.guru_id
			 WHERE r.siswa_id = ?
			 ORDER BY r.created_at DESC`
		)
		.all(siswaId) as StudentRequestRow[];
}

export function listAllRequests(): RequestRow[] {
	return db()
		.prepare(
			`SELECT r.*, s.nama AS nama_siswa, g.nama AS nama_guru
			 FROM counseling_requests r
			 JOIN users s ON s.id = r.siswa_id
			 LEFT JOIN users g ON g.id = r.guru_id
			 ORDER BY r.created_at DESC`
		)
		.all() as RequestRow[];
}

export function listOpenRequests(): RequestRow[] {
	return db()
		.prepare(
			`SELECT r.*, u.nama AS nama_siswa
			 FROM counseling_requests r
			 JOIN users u ON u.id = r.siswa_id
			 WHERE r.status IN ('menunggu','dijadwalkan')
			 ORDER BY r.created_at ASC`
		)
		.all() as RequestRow[];
}

export function listSessionsForSiswa(siswaId: number): SessionRow[] {
	return db()
		.prepare(
			`SELECT s.*, r.jenis, r.topik, g.nama AS nama_guru,
			        f.rating AS feedback_rating, f.refleksi AS feedback_refleksi
			 FROM counseling_sessions s
			 JOIN counseling_requests r ON r.id = s.request_id
			 JOIN users g ON g.id = s.guru_id
			 LEFT JOIN session_feedback f ON f.session_id = s.id
			 WHERE s.siswa_id = ?
			 ORDER BY s.tanggal DESC`
		)
		.all(siswaId) as SessionRow[];
}

export function listSessions(): SessionRow[] {
	return db()
		.prepare(
			`SELECT s.*, r.jenis, r.topik, u.nama AS nama_siswa, g.nama AS nama_guru,
			        f.rating AS feedback_rating, f.refleksi AS feedback_refleksi
			 FROM counseling_sessions s
			 JOIN counseling_requests r ON r.id = s.request_id
			 JOIN users u ON u.id = s.siswa_id
			 JOIN users g ON g.id = s.guru_id
			 LEFT JOIN session_feedback f ON f.session_id = s.id
			 ORDER BY s.tanggal DESC`
		)
		.all() as SessionRow[];
}

export function listSessionsByPeriod(awal: string, akhir: string): SessionRow[] {
	return db()
		.prepare(
			`SELECT s.*, r.jenis, r.topik, u.nama AS nama_siswa, g.nama AS nama_guru,
			        f.rating AS feedback_rating, f.refleksi AS feedback_refleksi
			 FROM counseling_sessions s
			 JOIN counseling_requests r ON r.id = s.request_id
			 JOIN users u ON u.id = s.siswa_id
			 JOIN users g ON g.id = s.guru_id
			 LEFT JOIN session_feedback f ON f.session_id = s.id
			 WHERE date(s.tanggal) BETWEEN ? AND ?
			 ORDER BY s.tanggal ASC`
		)
		.all(awal, akhir) as SessionRow[];
}

export function getSessionForFeedback(sessionId: number): (SessionRow & { status: RequestStatus }) | null {
	const row = db()
		.prepare(
			`SELECT s.*, r.jenis, r.topik, r.status, u.nama AS nama_siswa, g.nama AS nama_guru
			 FROM counseling_sessions s
			 JOIN counseling_requests r ON r.id = s.request_id
			 JOIN users u ON u.id = s.siswa_id
			 JOIN users g ON g.id = s.guru_id
			 WHERE s.id = ?
			 LIMIT 1`
		)
		.get(sessionId) as (SessionRow & { status: RequestStatus }) | undefined;
	return row ?? null;
}

export function getFeedbackBySession(sessionId: number): FeedbackRow | null {
	const row = db()
		.prepare('SELECT * FROM session_feedback WHERE session_id = ? LIMIT 1')
		.get(sessionId) as FeedbackRow | undefined;
	return row ?? null;
}

export function insertFeedback(
	sessionId: number,
	siswaId: number,
	rating: number,
	refleksi: string | null
): void {
	db()
		.prepare(
			`INSERT INTO session_feedback (session_id, siswa_id, rating, refleksi)
			 VALUES (?, ?, ?, ?)`
		)
		.run(sessionId, siswaId, rating, refleksi);
}

export function pendingFeedbackForSiswa(siswaId: number): SessionRow[] {
	return db()
		.prepare(
			`SELECT s.*, r.jenis, r.topik, g.nama AS nama_guru
			 FROM counseling_sessions s
			 JOIN counseling_requests r ON r.id = s.request_id
			 JOIN users g ON g.id = s.guru_id
			 WHERE s.siswa_id = ?
			   AND r.status = 'selesai'
			   AND NOT EXISTS (SELECT 1 FROM session_feedback f WHERE f.session_id = s.id)
			 ORDER BY s.tanggal DESC`
		)
		.all(siswaId) as SessionRow[];
}

export function getFeedbackStats(awal: string, akhir: string): {
	total: number;
	average: number | null;
} {
	const row = db()
		.prepare(
			`SELECT COUNT(*) AS total, AVG(f.rating) AS average
			 FROM session_feedback f
			 JOIN counseling_sessions s ON s.id = f.session_id
			 WHERE date(s.tanggal) BETWEEN ? AND ?`
		)
		.get(awal, akhir) as { total: number; average: number | null };
	return { total: row.total, average: row.average };
}

export interface UserList {
	users: User[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export function listUsers(opts: { search?: string; page?: number; pageSize?: number } = {}): UserList {
	const search = (opts.search ?? '').trim();
	const pageSize = Math.max(1, opts.pageSize ?? 10);
	const d = db();
	const where = search
		? `WHERE nama LIKE @like OR username LIKE @like OR COALESCE(nis, '') LIKE @like
		   OR COALESCE(kelas, '') LIKE @like OR COALESCE(email, '') LIKE @like OR COALESCE(telepon, '') LIKE @like`
		: '';
	const like = `%${search}%`;
	const total = (
		d.prepare(`SELECT COUNT(*) AS n FROM users ${where}`).get({ like }) as { n: number }
	).n;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const page = Math.min(Math.max(1, opts.page ?? 1), totalPages);
	const users = d
		.prepare(`SELECT * FROM users ${where} ORDER BY role, nama LIMIT @limit OFFSET @offset`)
		.all({ like, limit: pageSize, offset: (page - 1) * pageSize }) as User[];
	return { users, total, page, pageSize, totalPages };
}

export function getUserById(id: number): User | null {
	const row = db().prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
	return row ?? null;
}

function ensure_default_admin(d: Database.Database): void {
	const row = d.prepare(`SELECT COUNT(*) AS total FROM users WHERE role = 'admin'`).get() as {
		total: number;
	};
	if (row.total > 0) return;
	const hash = bcrypt.hashSync('admin123', 10);
	d.prepare(
		`INSERT INTO users (username, password, nama, role, email)
		 VALUES ('admin', ?, 'Administrator', 'admin', 'admin@man1jember.sch.id')`
	).run(hash);
}
