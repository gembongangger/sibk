<script lang="ts">
	import type { PageData } from './$types';
	import Alert from '$lib/components/Alert.svelte';
	import Stars from '$lib/components/Stars.svelte';
	import { formatDate, formatDateTime } from '$lib/utils';

	let { data }: { data: PageData } = $props();

	function printReport() {
		window.print();
	}
</script>

<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
	<div>
		<h1 class="text-lg font-semibold text-slate-900">Laporan Layanan BK</h1>
		<p class="text-xs text-slate-600 mt-1">Rekap sesi konseling berdasarkan periode tanggal.</p>
	</div>
	<button onclick={printReport} class="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 print:hidden">
		Cetak Laporan
	</button>
</div>

{#if data.error}
	<Alert type="error">{data.error}</Alert>
{/if}

<form method="GET" action="/reports" class="mb-4 text-xs flex flex-wrap items-end gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 print:hidden">
	<div>
		<label for="awal" class="block mb-1 text-slate-600">Tanggal awal</label>
		<input id="awal" type="date" name="awal" value={data.awal} class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs" />
	</div>
	<div>
		<label for="akhir" class="block mb-1 text-slate-600">Tanggal akhir</label>
		<input id="akhir" type="date" name="akhir" value={data.akhir} class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs" />
	</div>
	<button type="submit" class="mt-1 inline-flex items-center rounded-lg bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-700">
		Tampilkan
	</button>
</form>

<div class="rounded-2xl bg-white shadow-sm border border-slate-100 p-4">
	<div class="flex justify-between items-center mb-3">
		<div>
			<h2 class="text-sm font-semibold text-slate-900">Rekap Sesi Konseling</h2>
			<p class="text-sm text-slate-500">Periode {formatDate(data.awal)} s.d. {formatDate(data.akhir)}</p>
		</div>
		<div class="text-right text-sm text-slate-500">
			<div>Total sesi: {data.sessions.length}</div>
		</div>
	</div>

	{#if data.feedbackStats.average !== null}
		<div class="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 print:hidden">
			<div>
				<div class="text-sm text-slate-500">Umpan balik terkumpul</div>
				<div class="text-sm font-semibold text-slate-900">{data.feedbackStats.total}</div>
			</div>
			<div>
				<div class="text-sm text-slate-500">Rata-rata kepuasan</div>
				<div class="flex items-center gap-2">
					<span class="text-sm font-semibold text-slate-900">{Number(data.feedbackStats.average).toFixed(1)} / 5</span>
					<Stars rating={Math.round(data.feedbackStats.average)} size="text-sm" />
				</div>
			</div>
			<div class="text-xs text-slate-400">
				Evaluasi kepuasan layanan BK berdasarkan umpan balik siswa pada periode ini.
			</div>
		</div>
	{/if}

	<div class="overflow-x-auto">
		<table class="min-w-full text-xs align-top">
			<thead>
				<tr class="border-b border-slate-100 text-slate-500">
					<th class="py-2 text-left">Tanggal</th>
					<th class="py-2 text-left">Siswa</th>
					<th class="py-2 text-left">Jenis/Topik</th>
					<th class="py-2 text-left">Guru BK</th>
					<th class="py-2 text-left">Tempat</th>
					<th class="py-2 text-left">Ringkasan</th>
					<th class="py-2 text-left">Kepuasan</th>
				</tr>
			</thead>
			<tbody>
				{#if data.sessions.length === 0}
					<tr>
						<td colspan="7" class="py-3 text-center text-slate-500">Belum ada sesi konseling pada periode ini.</td>
					</tr>
				{/if}
				{#each data.sessions as s (s.id)}
					<tr class="border-b border-slate-50">
						<td class="py-1.5 text-slate-600">{formatDateTime(s.tanggal)}</td>
						<td class="py-1.5 text-slate-700">{s.nama_siswa}</td>
						<td class="py-1.5 text-slate-700">
							<div class="font-medium">{s.jenis}</div>
							<div class="text-sm text-slate-500">{s.topik}</div>
						</td>
						<td class="py-1.5 text-slate-700">{s.nama_guru}</td>
						<td class="py-1.5 text-slate-700">{s.tempat}</td>
						<td class="py-1.5 text-slate-700">
							<div class="max-w-xs whitespace-pre-line">{s.catatan}</div>
						</td>
						<td class="py-1.5">
							{#if s.feedback_rating}
								<Stars rating={s.feedback_rating} size="text-sm" />
							{:else}
								<span class="text-xs text-slate-300">—</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
