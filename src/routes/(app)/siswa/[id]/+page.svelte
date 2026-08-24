<script lang="ts">
	import type { PageData } from './$types';
	import Stars from '$lib/components/Stars.svelte';
	import { formatDateTime } from '$lib/utils';

	let { data }: { data: PageData } = $props();
</script>

<div class="mb-4">
	<a href="/requests" class="text-xs text-primary-700 hover:underline">← Kembali ke Permohonan</a>
	<h1 class="text-lg font-semibold text-slate-900 mt-2">Riwayat Konseling — {data.siswa.nama}</h1>
	<p class="text-xs text-slate-600 mt-1">
		NIS {data.siswa.nis ?? '-'} • Kelas {data.siswa.kelas ?? '-'}
	</p>
</div>

<div class="card">
	<h2 class="text-sm font-semibold text-slate-900 mb-3">Riwayat Sesi Konseling</h2>
	<div class="overflow-x-auto">
		<table class="data-table min-w-full text-xs">
			<thead>
				<tr class="border-b border-slate-100 text-slate-500">
					<th>Tanggal</th>
					<th>Jenis</th>
					<th>Topik</th>
					<th>Guru BK</th>
					<th>Tempat</th>
					<th>Catatan</th>
					<th>Tindak Lanjut</th>
					<th>Umpan Balik</th>
				</tr>
			</thead>
			<tbody>
				{#if data.riwayat.length === 0}
					<tr>
						<td colspan="8" class="py-6 text-center text-slate-500">Belum ada riwayat konseling untuk siswa ini.</td>
					</tr>
				{/if}
				{#each data.riwayat as sesi (sesi.id)}
					<tr class="border-b border-slate-50">
						<td class="text-slate-600 whitespace-nowrap">{formatDateTime(sesi.tanggal)}</td>
						<td class="text-slate-700">{sesi.jenis}</td>
						<td class="text-slate-700">
							<div class="font-medium">{sesi.topik}</div>
						</td>
						<td class="text-slate-700">{sesi.nama_guru ?? '-'}</td>
						<td class="text-slate-700">{sesi.tempat}</td>
						<td class="text-slate-700">
							<div class="max-w-xs whitespace-pre-line">{sesi.catatan}</div>
						</td>
						<td class="text-slate-700">
							<div class="max-w-xs whitespace-pre-line">{sesi.tindak_lanjut ?? '-'}</div>
						</td>
						<td class="py-1.5">
							{#if sesi.feedback_rating}
								<Stars rating={sesi.feedback_rating} size="text-sm" />
								{#if sesi.feedback_refleksi}
									<div class="max-w-[180px] text-xs text-slate-500 mt-0.5 line-clamp-2 whitespace-pre-line" title={sesi.feedback_refleksi}>
										{sesi.feedback_refleksi}
									</div>
								{/if}
							{:else}
								<span class="text-xs text-slate-300">Belum ada</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
