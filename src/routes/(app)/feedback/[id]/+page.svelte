<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import Alert from '$lib/components/Alert.svelte';
	import Stars from '$lib/components/Stars.svelte';
	import { formatDateTime } from '$lib/utils';

	let { data }: { data: PageData } = $props();

	let rating = $state(0);
	let refleksi = $state('');

	const labels = ['Sangat Kurang', 'Kurang', 'Cukup', 'Baik', 'Sangat Baik'];
</script>

<div class="max-w-xl">
	{#if data.feedback}
		<div class="rounded-2xl bg-white shadow-sm border border-slate-100 p-6">
			<div class="flex items-center gap-2 mb-1">
				<span class="text-lg font-semibold text-slate-900">Terima kasih!</span>
				<span>🎉</span>
			</div>
			<p class="text-xs text-slate-600 mb-4">
				Umpan balik Anda untuk sesi konseling ini sudah tersimpan. Masukan Anda sangat berarti
				bagi peningkatan kualitas layanan BK.
			</p>
			<div class="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3">
				<div>
					<div class="text-sm text-slate-500 mb-1">Tingkat kepuasan</div>
					<Stars rating={data.feedback.rating} size="text-lg" />
					<div class="text-xs text-slate-700 mt-1">
						{data.feedback.rating}/5 — {labels[data.feedback.rating - 1]}
					</div>
				</div>
				{#if data.feedback.refleksi}
					<div>
						<div class="text-sm text-slate-500 mb-1">Refleksi Anda</div>
						<p class="text-xs text-slate-700 whitespace-pre-line">{data.feedback.refleksi}</p>
					</div>
				{/if}
				<div class="text-xs text-slate-400">Dikirim {formatDateTime(data.feedback.created_at)}</div>
			</div>
			<a href="/" class="mt-4 inline-flex items-center rounded-full border border-primary-600 px-4 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-50">
				Kembali ke dashboard
			</a>
		</div>
	{:else}
		<h1 class="text-lg font-semibold text-slate-900 mb-1">Umpan Balik Sesi Konseling</h1>
		<p class="text-xs text-slate-600 mb-4">
			Bagikan pengalaman Anda setelah sesi konseling selesai. Feedback ini digunakan untuk
			evaluasi dan peningkatan kualitas layanan BK.
		</p>

		{#if $page.form?.error}
			<Alert type="error">{$page.form.error}</Alert>
		{/if}
		{#if $page.form?.success}
			<Alert type="success">{$page.form.success}</Alert>
		{/if}

		<form method="POST" action="?/kirim" class="space-y-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
			<div class="rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs space-y-1">
				<div class="flex items-center justify-between">
					<span class="text-slate-500">Siswa</span>
					<span class="font-medium text-slate-800">{data.session.nama_siswa}</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-slate-500">Guru BK</span>
					<span class="font-medium text-slate-800">{data.session.nama_guru}</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-slate-500">Jenis / Topik</span>
					<span class="font-medium text-slate-800">{data.session.jenis} — {data.session.topik}</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-slate-500">Tanggal sesi</span>
					<span class="font-medium text-slate-800">{formatDateTime(data.session.tanggal)}</span>
				</div>
			</div>

			<div>
				<fieldset>
					<legend class="block text-xs font-medium text-slate-700 mb-1">Tingkat kepuasan <span class="text-rose-500">*</span></legend>
					<div class="flex items-center gap-1">
						{#each [1, 2, 3, 4, 5] as value}
							<input
								type="radio"
								name="rating"
								id="rating-{value}"
								value={value}
								bind:group={rating}
								class="peer sr-only"
							/>
							<label
								for="rating-{value}"
								title={labels[value - 1]}
								class="cursor-pointer text-3xl leading-none transition
									{value <= rating ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300'}"
							>
								★
							</label>
						{/each}
					</div>
				</fieldset>
				{#if rating > 0}
					<div class="mt-1 text-xs text-slate-600">{rating}/5 — {labels[rating - 1]}</div>
				{/if}
			</div>

			<div>
				<label for="refleksi" class="block text-xs font-medium text-slate-700 mb-1">
					Refleksi / Respon singkat
				</label>
				<textarea
					id="refleksi"
					name="refleksi"
					rows="4"
					bind:value={refleksi}
					placeholder="Ceritakan pengalaman Anda selama sesi konseling, apakah layanan yang diberikan membantu..."
					class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-600"
				></textarea>
			</div>

			<button type="submit" class="w-full inline-flex items-center justify-center rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700">
				Kirim Umpan Balik
			</button>
		</form>
	{/if}
</div>
