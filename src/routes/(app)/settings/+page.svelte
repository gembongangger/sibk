<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import Alert from '$lib/components/Alert.svelte';
	import { Clock, BookOpen, HeartHandshake } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();

	let duration = $state('30');
	let tingkatText = $state('');
	let programText = $state('');
	let nomorText = $state('');
	let jenisLayananText = $state('');

	$effect(() => {
		duration = String(data.duration);
		tingkatText = data.tingkatOptions.join('\n');
		programText = data.programOptions.join('\n');
		nomorText = data.nomorOptions.join('\n');
		jenisLayananText = data.jenisLayanan.join('\n');
	});
</script>

<div class="mb-6">
	<h1 class="text-lg font-semibold text-slate-900">Pengaturan</h1>
	<p class="text-xs text-slate-600 mt-1">Konfigurasi sistem Bimbingan dan Konseling.</p>
</div>

{#if $page.form?.error}
	<Alert type="error">{$page.form.error}</Alert>
{/if}
{#if $page.form?.success}
	<Alert type="success">{$page.form.success}</Alert>
{/if}

<div class="max-w-2xl">
	<div class="card">
		<div class="flex items-center gap-2 mb-4">
			<div class="h-9 w-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
				<Clock size={18} strokeWidth={2} />
			</div>
			<div>
				<h2 class="text-sm font-semibold text-slate-900">Durasi Sesi Konseling</h2>
				<p class="text-[11px] text-slate-400">Menentukan interval waktu yang ditawarkan saat booking</p>
			</div>
		</div>

		<form method="POST" action="?/simpanDurasi" class="space-y-3">
			<div>
				<label for="duration" class="block mb-1 text-xs text-slate-600">Durasi per sesi (menit)</label>
				<select
					id="duration"
					name="duration"
					bind:value={duration}
					class="input"
				>
					<option value="15">15 menit</option>
					<option value="20">20 menit</option>
					<option value="30">30 menit</option>
					<option value="45">45 menit</option>
					<option value="60">60 menit (1 jam)</option>
				</select>
			</div>

			<div class="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
				<p class="font-medium text-slate-700 mb-1">Contoh jadwal dengan durasi {duration} menit:</p>
				<div class="flex flex-wrap gap-1.5">
					{#each Array.from({ length: Math.floor((15 * 60 - 7 * 60 - 30) / Number(duration)) }, (_, i) => {
						const mins = 7 * 60 + 30 + i * Number(duration);
						const h = Math.floor(mins / 60);
						const m = mins % 60;
						return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
					}) as time}
						<span class="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700">{time}</span>
					{/each}
				</div>
			</div>

			<button type="submit" class="btn btn-primary">
				Simpan Pengaturan
			</button>
		</form>
	</div>

	<div class="card mt-6">
		<div class="flex items-center gap-2 mb-4">
			<div class="h-9 w-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
				<BookOpen size={18} strokeWidth={2} />
			</div>
			<div>
				<h2 class="text-sm font-semibold text-slate-900">Opsi Nama Kelas</h2>
				<p class="text-[11px] text-slate-400">
					Nama kelas tersusun dari 3 bagian: tingkat + program + nomor (mis. X IPA 1).
					Satu opsi per baris di masing-masing kolom.
				</p>
			</div>
		</div>

		<form method="POST" action="?/simpanKelas" class="space-y-3">
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
				<div>
					<label for="tingkatOptions" class="block mb-1 text-xs text-slate-600">Tingkat Kelas</label>
					<textarea
						id="tingkatOptions"
						name="tingkatOptions"
						rows="6"
						bind:value={tingkatText}
						class="input font-mono text-xs"
						placeholder={"X\nXI\nXII"}
					></textarea>
				</div>
				<div>
					<label for="programOptions" class="block mb-1 text-xs text-slate-600">Program Kelas</label>
					<textarea
						id="programOptions"
						name="programOptions"
						rows="6"
						bind:value={programText}
						class="input font-mono text-xs"
						placeholder={"IPA\nIPS\nBahasa"}
					></textarea>
				</div>
				<div>
					<label for="nomorOptions" class="block mb-1 text-xs text-slate-600">Nomor Kelas</label>
					<textarea
						id="nomorOptions"
						name="nomorOptions"
						rows="6"
						bind:value={nomorText}
						class="input font-mono text-xs"
						placeholder={"1\n2\n3"}
					></textarea>
				</div>
			</div>

			<div class="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
				<p class="font-medium text-slate-700 mb-1">Kombinasi yang dihasilkan:</p>
				<div class="flex flex-wrap gap-1.5">
					{#each data.tingkatOptions as t}
						{#each data.programOptions as p}
							{#each data.nomorOptions as n}
								<span class="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">{t} {p} {n}</span>
							{/each}
						{/each}
					{/each}
				</div>
			</div>

			<button type="submit" class="btn btn-primary">
				Simpan Daftar Kelas
			</button>
		</form>
	</div>

	<div class="card mt-6">
		<div class="flex items-center gap-2 mb-4">
			<div class="h-9 w-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
				<HeartHandshake size={18} strokeWidth={2} />
			</div>
			<div>
				<h2 class="text-sm font-semibold text-slate-900">Jenis Layanan BK</h2>
				<p class="text-[11px] text-slate-400">
					Opsi jenis layanan yang tersedia saat siswa mengajukan permohonan konseling. Satu opsi per baris.
				</p>
			</div>
		</div>

		<form method="POST" action="?/simpanJenisLayanan" class="space-y-3">
			<div>
				<label for="jenisLayanan" class="block mb-1 text-xs text-slate-600">Daftar Jenis Layanan</label>
				<textarea
					id="jenisLayanan"
					name="jenisLayanan"
					rows="6"
					bind:value={jenisLayananText}
					class="input font-mono text-xs"
					placeholder={"Pribadi\nSosial\nBelajar\nKarier"}
				></textarea>
			</div>

			<div class="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
				<p class="font-medium text-slate-700 mb-1">Opsi aktif:</p>
				<div class="flex flex-wrap gap-1.5">
					{#each jenisLayananText.split('\n').map((s) => s.trim()).filter((s) => s.length > 0) as j}
						<span class="inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">{j}</span>
					{/each}
				</div>
			</div>

			<button type="submit" class="btn btn-primary">
				Simpan Jenis Layanan
			</button>
		</form>
	</div>
</div>