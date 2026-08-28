import https from 'node:https';
import type { MoodleConfig } from './db';

const TIMEOUT_MS = 8000;

export type MoodleVerifyResult =
	| { ok: true; username: string; fullname: string }
	| { ok: false; reason: MoodleFailureReason };

export type MoodleFailureReason =
	| 'invalid' // kredensial salah
	| 'unreachable' // jaringan/TLS/HTTP error
	| 'misconfigured' // pengaturan SIBK (URL/shortname)
	| 'wsdisabled' // web services belum diaktifkan di Moodle
	| 'service' // service shortname belum dibuat/dinonaktifkan
	| 'authcap' // akun belum diizinkan membuat token
	| 'protocol'; // protokol REST belum diaktifkan

function buildAgent(config: MoodleConfig): https.Agent | undefined {
	if (!config.skipTlsVerify) return undefined;
	return new https.Agent({ rejectUnauthorized: false });
}

async function fetchJson(url: string, init: RequestInit & { agent?: https.Agent }): Promise<{ status: number; body: unknown }> {
	const res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
	let body: unknown = null;
	try {
		body = await res.json();
	} catch {
		/* non-JSON response */
	}
	return { status: res.status, body };
}

const INVALID_CODES = new Set(['invalidlogin', 'usernamenotfound', 'invalidloginreason']);
const SERVICE_CODES = new Set(['servicenotavailable', 'servicedonotexist', 'serviceshortnamedonotexist']);
const AUTH_CAP_CODES = new Set(['cannotcreatetoken', 'missingrequiredcapability', 'usernotallowed']);
const WS_DISABLED_CODES = new Set(['webservicesdisabled', 'enablewsdescription', 'wsdisableddescription']);
const PROTOCOL_CODES = new Set(['webserviceprotocolnotenabled', 'webserviceexcluded']);

function mapTokenError(code?: string): MoodleFailureReason {
	if (!code) return 'misconfigured';
	if (INVALID_CODES.has(code)) return 'invalid';
	if (SERVICE_CODES.has(code)) return 'service';
	if (AUTH_CAP_CODES.has(code)) return 'authcap';
	if (WS_DISABLED_CODES.has(code)) return 'wsdisabled';
	if (PROTOCOL_CODES.has(code) || /protocol/i.test(code)) return 'protocol';
	return 'misconfigured';
}

/** Verifikasi kredensial Moodle via login/token.php lalu konfirmasi
 *  token lewat core_webservice_get_site_info.
 *  Password tidak pernah disimpan maupun di-log. */
export async function verifyMoodleLogin(
	config: MoodleConfig,
	username: string,
	password: string
): Promise<MoodleVerifyResult> {
	if (!config.baseUrl || !config.serviceShortname) {
		return { ok: false, reason: 'misconfigured' };
	}

	const tokenUrl = new URL('/login/token.php', config.baseUrl);
	const form = new URLSearchParams({
		username,
		password,
		service: config.serviceShortname
	});

	let resp: { status: number; body: unknown };
	try {
		resp = await fetchJson(tokenUrl.toString(), {
			method: 'POST',
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			body: form,
			agent: buildAgent(config)
		});
	} catch {
		return { ok: false, reason: 'unreachable' };
	}

	if (resp.status >= 500) {
		return { ok: false, reason: 'unreachable' };
	}

	const tokenPayload = resp.body as { token?: string; error?: boolean; errorcode?: string } | null;
	if (!tokenPayload || typeof tokenPayload.token !== 'string' || tokenPayload.token.length === 0) {
		return { ok: false, reason: mapTokenError(tokenPayload?.errorcode) };
	}

	const infoUrl = new URL('/webservice/rest/server.php', config.baseUrl);
	infoUrl.searchParams.set('wstoken', tokenPayload.token);
	infoUrl.searchParams.set('moodlewsrestformat', 'json');
	infoUrl.searchParams.set('wsfunction', 'core_webservice_get_site_info');

	let info: { status: number; body: unknown };
	try {
		info = await fetchJson(infoUrl.toString(), {
			method: 'GET',
			agent: buildAgent(config)
		});
	} catch {
		return { ok: false, reason: 'unreachable' };
	}

	const infoPayload = info.body as
		| { username?: string; fullname?: string; errorcode?: string; error?: boolean }
		| null;

	if (
		info.status >= 200 &&
		info.status < 400 &&
		infoPayload &&
		typeof infoPayload.username === 'string' &&
		infoPayload.username.toLowerCase() === username.toLowerCase()
	) {
		return { ok: true, username: infoPayload.username, fullname: infoPayload.fullname ?? username };
	}

	if (infoPayload?.errorcode === 'invalidtoken' || infoPayload?.error) {
		const code = infoPayload?.errorcode ?? '';
		if (PROTOCOL_CODES.has(code) || /protocol/i.test(code)) return { ok: false, reason: 'protocol' };
		if (SERVICE_CODES.has(code) || /servicedonotexist/i.test(code)) return { ok: false, reason: 'service' };
		if (code === 'invalidtoken') return { ok: false, reason: 'invalid' };
		return { ok: false, reason: 'misconfigured' };
	}

	return { ok: false, reason: 'misconfigured' };
}