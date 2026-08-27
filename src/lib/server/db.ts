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
	angkatan: number | null;
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
	kelas_siswa?: string | null;
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
	nis?: string | null;
	kelas?: string | null;
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

	// Kolom angkatan untuk database lama yang belum memilikinya
	const userCols = d.pragma('table_info(users)') as { name: string }[];
	if (!userCols.some((c) => c.name === 'angkatan')) {
		d.exec('ALTER TABLE users ADD COLUMN angkatan INTEGER');
	}

	d.exec(`
		CREATE TABLE IF NOT EXISTS app_settings (
			key TEXT PRIMARY KEY,
			value TEXT NOT NULL
		);
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
	const j = normalizeJadwal(jadwal);
	d.transaction(() => {
		const req = d.prepare('SELECT * FROM counseling_requests WHERE id = ?').get(id) as
			| { siswa_id: number }
			| undefined;
		d.prepare(
			`UPDATE counseling_requests SET status = ?, jadwal = ?, guru_id = ? WHERE id = ?`
		).run(status, j || null, guruId, id);
		if (status === 'selesai' && req) {
			const adaSesi = d.prepare('SELECT id FROM counseling_sessions WHERE request_id = ? LIMIT 1').get(id);
			if (!adaSesi) {
				const tanggal =
					j || (d.prepare("SELECT datetime('now','localtime') AS t").get() as { t: string }).t;
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
			`SELECT r.*, s.nama AS nama_siswa, s.kelas AS kelas_siswa, g.nama AS nama_guru
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

export function listGuruBK(): { id: number; nama: string }[] {
	return db()
		.prepare(`SELECT id, nama FROM users WHERE role = 'guru' ORDER BY nama`)
		.all() as { id: number; nama: string }[];
}

export function normalizeJadwal(jadwal: string): string {
	if (!jadwal) return jadwal;
	if (jadwal.includes('T')) {
		return jadwal.replace('T', ' ') + (jadwal.length <= 16 ? ':00' : '');
	}
	if (jadwal.length <= 16 && !jadwal.endsWith(':00')) {
		return jadwal + ':00';
	}
	return jadwal;
}

export function checkGuruAvailability(
	guruId: number,
	jadwal: string,
	excludeRequestId?: number
): { available: boolean; conflictSource?: 'request' | 'session'; conflictDetail?: string } {
	const d = db();
	const j = normalizeJadwal(jadwal);

	const conflictReq = d
		.prepare(
			`SELECT r.id, r.status, s.nama AS nama_siswa
			 FROM counseling_requests r
			 JOIN users s ON s.id = r.siswa_id
			 WHERE r.guru_id = ? AND (r.jadwal = ? OR r.jadwal = ?)
			   AND r.status IN ('menunggu','dijadwalkan')
			   AND r.id != ?
			 LIMIT 1`
		)
		.get(guruId, j, j.replace(':00', ''), excludeRequestId ?? 0) as
		| { id: number; status: string; nama_siswa: string }
		| undefined;

	if (conflictReq) {
		return {
			available: false,
			conflictSource: 'request',
			conflictDetail: `Sudah dijadwalkan untuk ${conflictReq.nama_siswa} (${conflictReq.status})`
		};
	}

	const conflictSession = d
		.prepare(
			`SELECT cs.id, s.nama AS nama_siswa
			 FROM counseling_sessions cs
			 JOIN users s ON s.id = cs.siswa_id
			 WHERE cs.guru_id = ? AND (cs.tanggal = ? OR cs.tanggal = ?)
			 LIMIT 1`
		)
		.get(guruId, j, j.replace(':00', '')) as { id: number; nama_siswa: string } | undefined;

	if (conflictSession) {
		return {
			available: false,
			conflictSource: 'session',
			conflictDetail: `Sesi konseling sudah tercatat dengan ${conflictSession.nama_siswa}`
		};
	}

	return { available: true };
}

export function suggestAvailableSlots(
	guruId: number,
	date: string,
	durationMinutes?: number
): { time: string; available: boolean; reason?: string }[] {
	const d = db();
	const dur = durationMinutes ?? Number(getSetting('session_duration_minutes') ?? '30');
	const slots: { time: string; available: boolean; reason?: string }[] = [];

	const startMin = 7 * 60 + 30;
	const endMin = 15 * 60;

	for (let mins = startMin; mins + dur <= endMin; mins += dur) {
		const h = Math.floor(mins / 60);
		const m = mins % 60;
		const hh = String(h).padStart(2, '0');
		const mm = String(m).padStart(2, '0');
		slots.push({ time: `${date} ${hh}:${mm}:00`, available: true });
	}

	const bookedReq = d
		.prepare(
			`SELECT jadwal FROM counseling_requests
			 WHERE guru_id = ? AND status IN ('menunggu','dijadwalkan')
			   AND jadwal LIKE ?`
		)
		.all(guruId, `${date}%`) as { jadwal: string }[];

	const bookedSession = d
		.prepare(
			`SELECT tanggal FROM counseling_sessions
			 WHERE guru_id = ? AND tanggal LIKE ?`
		)
		.all(guruId, `${date}%`) as { tanggal: string }[];

	const bookedTimes = new Set<string>();
	for (const r of bookedReq) {
		const n = normalizeJadwal(r.jadwal);
		bookedTimes.add(n.slice(0, 16));
		bookedTimes.add(n.replace(':00', '').slice(0, 16));
	}
	for (const s of bookedSession) {
		const n = normalizeJadwal(s.tanggal);
		bookedTimes.add(n.slice(0, 16));
		bookedTimes.add(n.replace(':00', '').slice(0, 16));
	}

	for (const slot of slots) {
		const slotNorm = slot.time.slice(0, 16);
		const slotNoSec = slotNorm;
		if (bookedTimes.has(slotNorm) || bookedTimes.has(slotNoSec)) {
			slot.available = false;
			slot.reason = 'Sudah terjadwal';
		}
	}

	return slots;
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

export interface ReportFilter {
	kelas?: string;
	nama?: string;
	nis?: string;
}

function reportWhere(awal: string, akhir: string, filter: ReportFilter) {
	const clauses = ['date(s.tanggal) BETWEEN ? AND ?'];
	const params: string[] = [awal, akhir];
	if (filter.kelas) {
		clauses.push('u.kelas = ?');
		params.push(filter.kelas);
	}
	if (filter.nama) {
		clauses.push('u.nama LIKE ?');
		params.push(`%${filter.nama}%`);
	}
	if (filter.nis) {
		clauses.push("COALESCE(u.nis, '') LIKE ?");
		params.push(`%${filter.nis}%`);
	}
	return { where: clauses.join('\n\t\t\t AND '), params };
}

export function listKelasOptions(): string[] {
	return (
		db()
			.prepare(
				`SELECT DISTINCT kelas FROM users
				 WHERE role = 'siswa' AND kelas IS NOT NULL AND kelas != ''
				 ORDER BY kelas`
			)
			.all()
			.map((row) => (row as { kelas: string }).kelas)
	);
}

export function listSessionsByPeriod(awal: string, akhir: string, filter: ReportFilter = {}): SessionRow[] {
	const { where, params } = reportWhere(awal, akhir, filter);
	return db()
		.prepare(
			`SELECT s.*, r.jenis, r.topik, u.nama AS nama_siswa, u.nis, u.kelas, g.nama AS nama_guru,
			        f.rating AS feedback_rating, f.refleksi AS feedback_refleksi
			 FROM counseling_sessions s
			 JOIN counseling_requests r ON r.id = s.request_id
			 JOIN users u ON u.id = s.siswa_id
			 JOIN users g ON g.id = s.guru_id
			 LEFT JOIN session_feedback f ON f.session_id = s.id
			 WHERE ${where}
			 ORDER BY s.tanggal ASC`
		)
		.all(...params) as SessionRow[];
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

export function getFeedbackStats(awal: string, akhir: string, filter: ReportFilter = {}): {
	total: number;
	average: number | null;
} {
	const { where, params } = reportWhere(awal, akhir, filter);
	const row = db()
		.prepare(
			`SELECT COUNT(*) AS total, AVG(f.rating) AS average
			 FROM session_feedback f
			 JOIN counseling_sessions s ON s.id = f.session_id
			 JOIN users u ON u.id = s.siswa_id
			 WHERE ${where}`
		)
		.get(...params) as { total: number; average: number | null };
	return { total: row.total, average: row.average };
}

export interface UserList {
	users: User[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export function getSetting(key: string): string | null {
	const row = db().prepare('SELECT value FROM app_settings WHERE key = ? LIMIT 1').get(key) as
		| { value: string }
		| undefined;
	return row?.value ?? null;
}

export function setSetting(key: string, value: string): void {
	db()
		.prepare(
			`INSERT INTO app_settings (key, value) VALUES (?, ?)
			 ON CONFLICT(key) DO UPDATE SET value = excluded.value`
		)
		.run(key, value);
}

const ANGKATAN_KEY = 'angkatan_aktif';

/** Daftar tahun angkatan yang ditandai aktif oleh admin.
 *  configured = false berarti belum pernah diatur -> semua siswa dianggap aktif. */
export function getAngkatanAktif(): { configured: boolean; years: number[] } {
	const raw = getSetting(ANGKATAN_KEY);
	if (raw === null) return { configured: false, years: [] };
	const years = raw
		.split(',')
		.map((s) => Number(s.trim()))
		.filter((n) => Number.isInteger(n) && n >= 1990 && n <= 2100);
	return { configured: true, years };
}

export function setAngkatanAktif(years: number[]): void {
	setSetting(
		ANGKATAN_KEY,
		[...new Set(years)]
			.filter((n) => Number.isInteger(n) && n >= 1990 && n <= 2100)
			.sort((a, b) => a - b)
			.join(',')
	);
}

export function listAngkatanOptions(): number[] {
	return (
		db()
			.prepare(
				`SELECT DISTINCT angkatan FROM users
				 WHERE role = 'siswa' AND angkatan IS NOT NULL
				 ORDER BY angkatan DESC`
			)
			.all()
			.map((row) => (row as { angkatan: number }).angkatan)
	);
}

export function parseAngkatan(raw: string): number | null {
	if (!raw) return null;
	const n = Number(raw);
	return Number.isInteger(n) && n >= 1990 && n <= 2100 ? n : null;
}

export function listUsers(
	opts: {
		search?: string;
		page?: number;
		pageSize?: number;
		angkatan?: number;
		status?: 'aktif' | 'nonaktif';
		activeAngkatan?: number[];
	} = {}
): UserList {
	const search = (opts.search ?? '').trim();
	const pageSize = Math.max(1, opts.pageSize ?? 10);
	const d = db();
	const clauses: string[] = [];
	const params: Record<string, unknown> = {};
	if (search) {
		clauses.push(`(nama LIKE @like OR username LIKE @like OR COALESCE(nis, '') LIKE @like
		   OR COALESCE(kelas, '') LIKE @like OR COALESCE(email, '') LIKE @like OR COALESCE(telepon, '') LIKE @like)`);
		params.like = `%${search}%`;
	}
	if (opts.angkatan !== undefined && opts.angkatan !== null) {
		clauses.push('angkatan = @f_angkatan');
		params.f_angkatan = opts.angkatan;
	}
	if (opts.status === 'aktif' || opts.status === 'nonaktif') {
		const active = opts.activeAngkatan ?? [];
		if (active.length > 0) {
			const ph = active.map((_, i) => `@akt${i}`).join(', ');
			active.forEach((y, i) => (params[`akt${i}`] = y));
			clauses.push(
				opts.status === 'aktif'
					? `(role != 'siswa' OR angkatan IN (${ph}))`
					: `(role = 'siswa' AND (angkatan IS NULL OR angkatan NOT IN (${ph})))`
			);
		} else {
			clauses.push(opts.status === 'aktif' ? `role != 'siswa'` : `role = 'siswa'`);
		}
	}
	const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
	const total = (
		d.prepare(`SELECT COUNT(*) AS n FROM users ${where}`).get(params) as { n: number }
	).n;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const page = Math.min(Math.max(1, opts.page ?? 1), totalPages);
	const users = d
		.prepare(`SELECT * FROM users ${where} ORDER BY role, nama LIMIT @limit OFFSET @offset`)
		.all({ ...params, limit: pageSize, offset: (page - 1) * pageSize }) as User[];
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
