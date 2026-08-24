<script lang="ts">
	import type { PageData } from './$types';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import { formatDateTime, toDateTimeLocal } from '$lib/utils';
	import { Users, GraduationCap, Hourglass, CalendarClock } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();
</script>

<section class="mb-6">
	<div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
		<div>
			<h1 class="text-xl font-semibold tracking-tight text-slate-900">Selamat datang, {data.user.nama}</h1>
			<p class="text-sm text-slate-500 mt-1">Ringkasan layanan Bimbingan dan Konseling MAN 1 Jember.</p>
		</div>
		<div class="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 border border-primary-100">
			<span class="relative flex h-2 w-2">
				<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
				<span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
			</span>
			<span>Aktif sebagai <span class="capitalize">{data.user.role}</span></span>
		</div>
	</div>
</section>

<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
	<div class="card">
		<div class="flex items-center justify-between">
			<div>
				<div class="text-xs font-medium text-slate-400">Total Siswa Terdaftar</div>
				<div class="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{data.totalSiswa}</div>
			</div>
			<div class="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
				<Users size={19} strokeWidth={2} />
			</div>
		</div>
	</div>
	<div class="card">
		<div class="flex items-center justify-between">
			<div>
				<div class="text-xs font-medium text-slate-400">Guru BK Aktif</div>
				<div class="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{data.totalGuru}</div>
			</div>
			<div class="h-10 w-10 rounded-xl bg-lime-50 text-lime-600 flex items-center justify-center">
				<GraduationCap size={19} strokeWidth={2} />
			</div>
		</div>
	</div>
	<div class="card">
		<div class="flex items-center justify-between">
			<div>
				<div class="text-xs font-medium text-slate-400">Permohonan Menunggu</div>
				<div class="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{data.totalPending}</div>
			</div>
			<div class="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
				<Hourglass size={19} strokeWidth={2} />
			</div>
		</div>
	</div>
	<div class="card">
		<div class="flex items-center justify-between">
			<div>
				<div class="text-xs font-medium text-slate-400">Sesi Terjadwal</div>
				<div class="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{data.totalUpcoming}</div>
			</div>
			<div class="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
				<CalendarClock size={19} strokeWidth={2} />
			</div>
		</div>
	</div>
</section>

{#if data.user.role === 'admin' || data.user.role === 'guru'}
	<section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<div class="lg:col-span-2 card">
			<div class="flex items-center justify-between mb-3">
				<h2 class="text-sm font-semibold text-slate-900">Permohonan Konseling Terbaru</h2>
				<a href="/requests" class="text-xs text-primary-700 hover:text-primary-800">Lihat semua</a>
			</div>
			{#if data.recentRequests.length === 0}
				<p class="text-xs text-slate-500">Belum ada permohonan konseling.</p>
			{:else}
				<ul class="divide-y divide-slate-100 text-xs">
					{#each data.recentRequests as req}
						<li class="py-2 flex items-center justify-between gap-3">
							<div>
								<div class="font-medium text-slate-800">{req.nama_siswa}</div>
								<div class="text-slate-500">{req.topik}</div>
							</div>
							<div class="text-right shrink-0">
								<StatusBadge status={req.status} />
								<div class="text-xs text-slate-400 mt-1">{formatDateTime(req.created_at)}</div>
								{#if req.status === 'menunggu' || req.status === 'dijadwalkan'}
									<details class="text-sm text-slate-600 mt-1">
										<summary class="cursor-pointer text-primary-700 inline-flex items-center gap-1">Kelola</summary>
										<form method="POST" action="?/kelola" class="mt-1 space-y-1 w-56">
											<input type="hidden" name="id" value={req.id} />
											<select name="status" class="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm">
												<option value="menunggu" selected={req.status === 'menunggu'}>Menunggu</option>
												<option value="dijadwalkan" selected={req.status === 'dijadwalkan'}>Dijadwalkan</option>
												<option value="selesai">Selesai</option>
												<option value="ditolak">Ditolak</option>
											</select>
											<input type="datetime-local" name="jadwal" value={toDateTimeLocal(req.jadwal)} class="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm" />
											<button type="submit" class="w-full btn btn-primary w-full">
												Simpan
											</button>
										</form>
									</details>
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
		<div class="card">
			<h2 class="text-sm font-semibold text-slate-900 mb-3">Panduan Singkat</h2>
			<ul class="space-y-2 text-xs text-slate-600">
				<li>1. Admin mengelola akun siswa dan guru BK.</li>
				<li>2. Siswa mengajukan permohonan konseling melalui menu Ajukan Konseling.</li>
				<li>3. Guru BK menjadwalkan dan mencatat hasil sesi konseling.</li>
				<li>4. Laporan layanan dapat diunduh berdasarkan periode tertentu.</li>
			</ul>
		</div>
	</section>
{:else}
	<section class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<div class="card">
			<h2 class="text-sm font-semibold text-slate-900 mb-2">Ajukan Konseling</h2>
			<p class="text-xs text-slate-600 mb-3">
				Jika kamu membutuhkan bantuan terkait belajar, pribadi, sosial, maupun karier,
				silakan ajukan permohonan konseling kepada guru BK.
			</p>
			<a href="/requests" class="btn btn-primary">
				Ajukan sekarang
			</a>
		</div>
		<div class="card">
			<h2 class="text-sm font-semibold text-slate-900 mb-2">Status Permohonan</h2>
			<p class="text-xs text-slate-600 mb-3">
				Pantau status permohonan konseling kamu, termasuk jadwal dan catatan dari guru BK.
			</p>
			<a href="/requests" class="btn btn-outline-green">
				Lihat permohonan
			</a>
		</div>
	</section>
	{#if data.pendingFeedback.length > 0}
		<section class="mt-6 card">
			<h2 class="text-sm font-semibold text-slate-900 mb-1">Sesi Selesai — Beri Umpan Balik</h2>
			<p class="text-xs text-slate-600 mb-3">
				Sesi konseling kamu telah selesai. Yuk beri umpan balik untuk membantu kami meningkatkan layanan BK.
			</p>
			<ul class="divide-y divide-slate-100 text-xs">
				{#each data.pendingFeedback as sesi (sesi.id)}
					<li class="py-2 flex items-center justify-between gap-3">
						<div>
							<div class="font-medium text-slate-800">{sesi.jenis} — {sesi.topik}</div>
							<div class="text-slate-500">Bersama {sesi.nama_guru}</div>
						</div>
						<a
							href="/feedback/{sesi.id}"
							class="shrink-0 btn btn-primary"
						>
							Beri Umpan Balik
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
{/if}
