<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import Alert from '$lib/components/Alert.svelte';
	import Stars from '$lib/components/Stars.svelte';
	import { formatDateTime } from '$lib/utils';

	let { data }: { data: PageData } = $props();

	let requestId = $state('');
	let siswaId = $state('');
	let tanggal = $state('');
	let tempat = $state('');
	let catatan = $state('');
	let tindakLanjut = $state('');

	function onRequestChange() {
		const select = document.getElementById('request-select') as HTMLSelectElement | null;
		if (!select) return;
		const option = select.options[select.selectedIndex];
		siswaId = option?.getAttribute('data-siswa') ?? '';
	}
</script>

<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
	<div>
		<h1 class="text-lg font-semibold text-slate-900">Sesi Konseling</h1>
		<p class="text-xs text-slate-600 mt-1">Catat hasil sesi konseling dan tindak lanjutnya.</p>
	</div>
</div>

{#if $page.form?.error}
	<Alert type="error">{$page.form.error}</Alert>
{/if}
{#if $page.form?.success}
	<Alert type="success">{$page.form.success}</Alert>
{/if}

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
	<div class="rounded-2xl bg-white shadow-sm border border-slate-100 p-4">
		<h2 class="text-sm font-semibold text-slate-900 mb-3">Catat Sesi Baru</h2>
		{#if data.openRequests.length === 0}
			<p class="text-xs text-slate-500">Belum ada permohonan menunggu atau dijadwalkan.</p>
		{:else}
			<form method="POST" action="?/catat" class="space-y-2 text-xs">
				<div>
					<label for="request-select" class="block mb-1 text-slate-600">Permohonan</label>
					<select
						id="request-select"
						name="request_id"
						bind:value={requestId}
						onchange={onRequestChange}
						class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
					>
						<option value="">Pilih permohonan</option>
						{#each data.openRequests as r}
							<option value={r.id} data-siswa={r.siswa_id}>
								{r.nama_siswa} - {r.topik}
							</option>
						{/each}
					</select>
				</div>
				<input type="hidden" name="siswa_id" value={siswaId} />
				<div>
					<label for="tanggal" class="block mb-1 text-slate-600">Tanggal dan Waktu</label>
					<input id="tanggal" type="datetime-local" name="tanggal" bind:value={tanggal} class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs" />
				</div>
				<div>
					<label for="tempat" class="block mb-1 text-slate-600">Tempat</label>
					<input id="tempat" type="text" name="tempat" bind:value={tempat} class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs" placeholder="contoh: Ruang BK" />
				</div>
				<div>
					<label for="catatan" class="block mb-1 text-slate-600">Catatan Konseling</label>
					<textarea id="catatan" name="catatan" rows="4" bind:value={catatan} class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs"></textarea>
				</div>
				<div>
					<label for="tindak_lanjut" class="block mb-1 text-slate-600">Rencana Tindak Lanjut</label>
					<textarea id="tindak_lanjut" name="tindak_lanjut" rows="3" bind:value={tindakLanjut} class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs"></textarea>
				</div>
				<button type="submit" class="mt-2 w-full inline-flex items-center justify-center rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700">
					Simpan Sesi
				</button>
			</form>
		{/if}
	</div>

	<div class="lg:col-span-2 rounded-2xl bg-white shadow-sm border border-slate-100 p-4">
		<h2 class="text-sm font-semibold text-slate-900 mb-3">Riwayat Sesi Konseling</h2>
		<div class="overflow-x-auto">
			<table class="min-w-full text-xs align-top">
				<thead>
					<tr class="border-b border-slate-100 text-slate-500">
						<th class="py-2 text-left">Tanggal</th>
						<th class="py-2 text-left">Siswa</th>
						<th class="py-2 text-left">Jenis/Topik</th>
						<th class="py-2 text-left">Tempat</th>
						<th class="py-2 text-left">Catatan</th>
						<th class="py-2 text-left">Tindak Lanjut</th>
						<th class="py-2 text-left">Umpan Balik</th>
					</tr>
				</thead>
				<tbody>
					{#if data.sessions.length === 0}
						<tr>
							<td colspan="7" class="py-3 text-center text-slate-500">Belum ada sesi konseling.</td>
						</tr>
					{/if}
					{#each data.sessions as s (s.id)}
						<tr class="border-b border-slate-50">
							<td class="py-1.5 text-slate-600">{formatDateTime(s.tanggal)}</td>
							<td class="py-1.5 text-slate-700">
								{s.nama_siswa}
								<a href="/siswa/{s.siswa_id}" class="block text-[10px] text-primary-700 hover:underline">Riwayat →</a>
							</td>
							<td class="py-1.5 text-slate-700">
								<div class="font-medium">{s.jenis}</div>
								<div class="text-[11px] text-slate-500">{s.topik}</div>
							</td>
							<td class="py-1.5 text-slate-700">{s.tempat}</td>
							<td class="py-1.5 text-slate-700">
								<div class="max-w-xs whitespace-pre-line">{s.catatan}</div>
							</td>
							<td class="py-1.5 text-slate-700">
								<div class="max-w-xs whitespace-pre-line">{s.tindak_lanjut ?? '-'}</div>
							</td>
							<td class="py-1.5">
								{#if s.feedback_rating}
									<Stars rating={s.feedback_rating} size="text-sm" />
									{#if s.feedback_refleksi}
										<div class="max-w-[180px] text-[10px] text-slate-500 mt-0.5 line-clamp-2 whitespace-pre-line" title={s.feedback_refleksi}>
											{s.feedback_refleksi}
										</div>
									{/if}
								{:else}
									<span class="text-[10px] text-slate-300">Belum ada</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
