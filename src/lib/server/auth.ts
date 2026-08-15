import { db, type User } from './db';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

const SESSION_COOKIE = 'bk_session';
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function createSession(userId: number): string {
	const token = crypto.randomBytes(32).toString('hex');
	db()
		.prepare(
			`INSERT INTO sessions (token, user_id, expires_at)
			 VALUES (?, ?, datetime('now', 'localtime', '+7 days'))`
		)
		.run(token, userId);
	return token;
}

export function destroySession(token: string): void {
	db().prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function destroyAllUserSessions(userId: number): void {
	db().prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
}

export function findSessionUser(token: string): User | null {
	const row = db()
		.prepare(
			`SELECT u.* FROM sessions s
			 JOIN users u ON u.id = s.user_id
			 WHERE s.token = ? AND s.expires_at > datetime('now', 'localtime')
			 LIMIT 1`
		)
		.get(token) as User | undefined;
	if (!row) return null;
	db()
		.prepare(`DELETE FROM sessions WHERE expires_at <= datetime('now', 'localtime')`)
		.run();
	return row;
}

export function findUserByUsername(username: string): User | null {
	const row = db()
		.prepare('SELECT * FROM users WHERE username = ? LIMIT 1')
		.get(username) as User | undefined;
	return row ?? null;
}

export function login(username: string, password: string): User | null {
	const user = findUserByUsername(username);
	if (!user) return null;
	if (!bcrypt.compareSync(password, user.password)) return null;
	return user;
}

export function hashPassword(password: string): string {
	return bcrypt.hashSync(password, 10);
}

export function getSessionCookie(): string {
	return SESSION_COOKIE;
}
