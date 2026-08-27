<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import Alert from '$lib/components/Alert.svelte';
	import { Clock, BookOpen } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();

	let duration = $state('30');
	let classNamesText = $state('');

	$effect(() => {
		duration = String(data.duration);
		classNamesText = data.classNames.join('\n');
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

<div class="max-w-lg">
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
				<h2 class="text-sm font-semibold text-slate-900">Daftar Nama Kelas</h2>
				<p class="text-[11px] text-slate-400">Satu kelas per baris. Digunakan di form pengguna dan filter laporan.</p>
			</div>
		</div>

		<form method="POST" action="?/simpanKelas" class="space-y-3">
			<div>
				<label for="classNames" class="block mb-1 text-xs text-slate-600">Nama kelas (satu per baris)</label>
				<textarea
					id="classNames"
					name="classNames"
					rows="8"
					bind:value={classNamesText}
					class="input font-mono text-xs"
					placeholder={"X IPA 1\nX IPA 2\nX IPS 1\nXI IPA 1\nXI IPA 2\nXI IPS 1"}
				></textarea>
			</div>

			<button type="submit" class="btn btn-primary">
				Simpan Daftar Kelas
			</button>
		</form>
	</div>
</div>
