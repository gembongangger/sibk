<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import Alert from '$lib/components/Alert.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import Stars from '$lib/components/Stars.svelte';
	import { formatDate, formatDateTime, formatTime, toDateTimeLocal } from '$lib/utils';
	import { CalendarDays } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();

	let jenis = $state('');
	let topik = $state('');
	let deskripsi = $state('');
	let jadwal = $state('');
	let guruId = $state('');
	let pickDate = $state('');
	let slots = $state<{ time: string; available: boolean; reason?: string }[]>([]);
	let loadingSlots = $state(false);

	async function fetchSlots() {
		if (!guruId || !pickDate) {
			slots = [];
			return;
		}
		loadingSlots = true;
		try {
			const res = await fetch(`/api/slots?guruId=${guruId}&date=${pickDate}`);
			const json = await res.json();
			slots = json.slots ?? [];
		} catch {
			slots = [];
		} finally {
			loadingSlots = false;
		}
	}

	function pickSlot(time: string) {
		jadwal = time;
		const form = document.getElementById('form-ajukan') as HTMLFormElement;
		const hidden = form?.elements.namedItem('jadwal') as HTMLInputElement | undefined;
		if (hidden) hidden.value = time;
		form?.requestSubmit();
	}
</script>

<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
	<div>
		<h1 class="text-lg font-semibold text-slate-900">
			{data.isGuru ? 'Permohonan Konseling Siswa' : 'Permohonan Konseling Saya'}
		</h1>
		<p class="text-xs text-slate-600 mt-1">
			{data.isGuru ? 'Kelola permohonan konseling yang diajukan siswa.' : 'Ajukan dan pantau permohonan konseling Anda.'}
		</p>
	</div>
</div>

{#if $page.form?.error}
	<Alert type="error">{$page.form.error}</Alert>
{/if}
{#if $page.form?.success}
	<Alert type="success">{$page.form.success}</Alert>
{/if}
{#if $page.form?.slotsConflict && $page.form?.availableSlots?.length}
	<div class="card border-amber-200 bg-amber-50">
		<h3 class="text-sm font-semibold text-amber-800 mb-2">Waktu yang Tersedia</h3>
		<p class="text-xs text-amber-700 mb-3">Pilih salah satu waktu berikut untuk melanjutkan:</p>
		<div class="flex flex-wrap gap-2">
			{#each $page.form.availableSlots as slot}
				<button
					type="submit"
					form="form-ajukan"
					name="jadwal"
					value={slot.time}
					class="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 hover:border-emerald-400"
				>
					<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
					{slot.time.slice(11, 16)}
				</button>
			{/each}
		</div>
	</div>
{/if}

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
	{#if data.user.role === 'siswa'}
		<div class="card">
			<h2 class="text-sm font-semibold text-slate-900 mb-3">Ajukan Permohonan Konseling</h2>
			<form method="POST" action="?/ajukan" id="form-ajukan" class="space-y-2 text-xs">
				<div>
					<label for="jenis" class="block mb-1 text-slate-600">Jenis Layanan</label>
					<select id="jenis" name="jenis" bind:value={jenis} class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs">
						<option value="">Pilih jenis layanan</option>
						{#each data.jenisLayanan as j}
							<option value={j}>{j}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="guru_id" class="block mb-1 text-slate-600">Guru BK</label>
					<select id="guru_id" name="guru_id" bind:value={guruId} class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs">
						<option value="">Pilih guru BK</option>
						{#each data.guruList as guru (guru.id)}
							<option value={guru.id}>{guru.nama}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="topik" class="block mb-1 text-slate-600">Topik Utama</label>
					<input id="topik" type="text" name="topik" bind:value={topik} class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs" />
				</div>
				<div>
					<label for="deskripsi" class="block mb-1 text-slate-600">Deskripsi Singkat</label>
					<textarea id="deskripsi" name="deskripsi" rows="4" bind:value={deskripsi} class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs"></textarea>
				</div>
				<div>
					<label for="jadwal-date" class="block mb-1 text-slate-600">Tanggal Konseling</label>
					<input
						id="jadwal-date"
						type="date"
						bind:value={pickDate}
						onchange={fetchSlots}
						min={new Date().toISOString().slice(0, 10)}
						disabled={!guruId}
						class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:opacity-50"
					/>
				</div>

				{#if pickDate && guruId}
					<div>
						<span class="block mb-1 text-slate-600 text-xs">Pilih Waktu</span>
						{#if loadingSlots}
							<div class="flex items-center gap-2 text-xs text-slate-400 py-2">
								<span class="h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></span>
								Memuat jadwal tersedia...
							</div>
						{:else if slots.length === 0}
							<p class="text-xs text-slate-400 py-2">Tidak ada slot waktu tersedia untuk tanggal ini.</p>
						{:else}
							<div class="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
								{#each slots as slot}
									<button
										type="button"
										onclick={() => slot.available && pickSlot(slot.time)}
										disabled={!slot.available}
										class="inline-flex items-center justify-center rounded-lg px-2 py-2 text-xs font-medium transition {slot.available
											? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 cursor-pointer'
											: 'border border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed line-through'}"
										title={slot.available ? `Pilih ${slot.time.slice(11, 16)}` : slot.reason}
									>
										{slot.time.slice(11, 16)}
									</button>
								{/each}
							</div>
							<p class="text-[11px] text-slate-400 mt-1.5">Klik waktu yang tersedia untuk langsung mengirim permohonan.</p>
						{/if}
					</div>
				{/if}

				<input type="hidden" name="jadwal" value={jadwal} />
				<button type="submit" class="mt-2 w-full btn btn-primary">
					Kirim Permohonan
				</button>
			</form>
		</div>
	{/if}

	<div class="{data.user.role === 'siswa' ? 'lg:col-span-2' : 'lg:col-span-3'} card">
		<h2 class="text-sm font-semibold text-slate-900 mb-3">Daftar Permohonan</h2>
		<div class="overflow-x-auto">
			<table class="data-table min-w-full text-xs">
				<thead>
					<tr class="border-b border-slate-100 text-slate-500">
						<th>Tanggal</th>
						{#if data.isGuru}<th>Siswa</th><th>Kelas</th>{/if}
						<th>Jenis</th>
						<th>Topik</th>
						<th>Guru BK</th>
						<th>Status</th>
						<th>Jadwal</th>
						{#if data.isGuru}<th class="py-2 text-right">Aksi</th>{:else}<th class="py-2 text-right">Umpan Balik</th>{/if}
					</tr>
				</thead>
				<tbody>
					{#if data.requests.length === 0}
						<tr>
							<td colspan={data.isGuru ? 9 : 7} class="py-3 text-center text-slate-500">Belum ada permohonan.</td>
						</tr>
					{/if}
					{#each data.requests as req (req.id)}
						<tr class="border-b border-slate-50 align-top">
							<td class="text-slate-600">
								{formatDate(req.created_at)}
								<div class="text-xs text-slate-400">{formatTime(req.created_at)}</div>
							</td>
							{#if data.isGuru}
							<td class="text-slate-700">
								{req.nama_siswa}
								<a href="/siswa/{req.siswa_id}" class="block text-xs text-primary-700 hover:underline">Riwayat →</a>
							</td>
							<td class="text-slate-600">{req.kelas_siswa ?? '-'}</td>
						{/if}
							<td class="text-slate-700">{req.jenis}</td>
							<td class="text-slate-700">
								<div class="font-medium">{req.topik}</div>
								<div class="text-xs text-slate-500 line-clamp-2">{req.deskripsi}</div>
							</td>
							<td class="text-slate-700">{req.nama_guru ?? '-'}</td>
							<td class="py-1.5"><StatusBadge status={req.status} /></td>
							<td class="text-slate-700">{req.jadwal ? formatDateTime(req.jadwal) : '-'}</td>
							{#if data.isGuru}
								<td class="text-right">
									<details class="text-sm text-slate-600">
										<summary class="cursor-pointer text-primary-700">Kelola</summary>
										<form method="POST" action="?/kelola" class="mt-2 space-y-1">
											<input type="hidden" name="id" value={req.id} />
											<div>
												<label for="status-{req.id}" class="block mb-0.5">Status</label>
												<select id="status-{req.id}" name="status" class="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm">
													<option value="menunggu" selected={req.status === 'menunggu'}>Menunggu</option>
													<option value="dijadwalkan" selected={req.status === 'dijadwalkan'}>Dijadwalkan</option>
													<option value="selesai" selected={req.status === 'selesai'}>Selesai</option>
													<option value="ditolak" selected={req.status === 'ditolak'}>Ditolak</option>
												</select>
											</div>
											<div>
												<label for="jadwal-{req.id}" class="block mb-0.5">Jadwal</label>
												<input id="jadwal-{req.id}" type="datetime-local" name="jadwal" value={toDateTimeLocal(req.jadwal)} class="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm" />
											</div>
											<button type="submit" class="mt-1 w-full btn btn-primary w-full">
												Simpan
											</button>
										</form>
								</details>
							</td>
						{:else}
							<td class="text-right whitespace-nowrap">
								{#if req.status === 'selesai' && req.session_id}
									{#if req.feedback_rating}
										<div class="inline-flex flex-col items-end gap-0.5">
											<Stars rating={req.feedback_rating} size="text-sm" />
											<span class="text-xs text-slate-400">Sudah memberi umpan balik</span>
										</div>
									{:else}
										<a href="/feedback/{req.session_id}" class="text-sm text-primary-700 hover:underline">
											Beri Umpan Balik →
										</a>
									{/if}
								{:else}
									<span class="text-xs text-slate-300">—</span>
								{/if}
							</td>
						{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
