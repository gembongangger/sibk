<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import Alert from '$lib/components/Alert.svelte';
	import Stars from '$lib/components/Stars.svelte';
	import { formatDate } from '$lib/utils';

	let { data }: { data: PageData } = $props();

	let showRiwayat = $state(false);
</script>

<div class="max-w-2xl">
	<h1 class="text-lg font-semibold text-slate-900 mb-1">Profil Pengguna</h1>
	<p class="text-xs text-slate-600 mb-4">Perbarui data diri dan password akun Anda.</p>

	{#if data.user.role === 'siswa'}
		<div class="mb-4 rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
			<div class="flex items-center justify-between gap-3">
				<div>
					<h2 class="text-sm font-semibold text-slate-900">Riwayat Konseling</h2>
					<p class="text-xs text-slate-500 mt-0.5">Lihat riwayat sesi konseling yang pernah Anda jalani.</p>
				</div>
				<button
					type="button"
					onclick={() => (showRiwayat = !showRiwayat)}
					class="inline-flex items-center rounded-lg bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
				>
					{showRiwayat ? 'Sembunyikan Riwayat' : 'Tampilkan Riwayat Konseling'}
				</button>
			</div>

			{#if showRiwayat}
				<div class="mt-4">
					{#if data.riwayat.length === 0}
						<p class="text-xs text-slate-500 py-3 text-center">Belum ada riwayat konseling.</p>
					{:else}
						<div class="overflow-x-auto">
							<table class="min-w-full text-xs">
								<thead>
									<tr class="border-b border-slate-100 text-slate-500">
										<th class="py-2 text-left">Tanggal</th>
										<th class="py-2 text-left">Jenis</th>
										<th class="py-2 text-left">Topik</th>
										<th class="py-2 text-left">Guru BK</th>
										<th class="py-2 text-left">Rating</th>
									</tr>
								</thead>
								<tbody>
									{#each data.riwayat as sesi (sesi.id)}
										<tr class="border-b border-slate-50 align-top">
											<td class="py-2 text-slate-600">{formatDate(sesi.tanggal)}</td>
											<td class="py-2 text-slate-700">{sesi.jenis}</td>
											<td class="py-2 text-slate-700">
												<div class="font-medium">{sesi.topik}</div>
												{#if sesi.feedback_refleksi}
													<div class="text-xs text-slate-500 line-clamp-2">{sesi.feedback_refleksi}</div>
												{/if}
											</td>
											<td class="py-2 text-slate-700">{sesi.nama_guru ?? '-'}</td>
											<td class="py-2">
												{#if sesi.feedback_rating}
													<Stars rating={sesi.feedback_rating} size="text-sm" />
												{:else}
													<span class="text-xs text-slate-400">Belum ada feedback</span>
												{/if}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}

	{#if $page.form?.error}
		<Alert type="error">{$page.form.error}</Alert>
	{/if}
	{#if $page.form?.success}
		<Alert type="success">{$page.form.success}</Alert>
	{/if}

	<form method="POST" action="?/simpan" class="space-y-3 text-xs bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
		<div>
			<label for="nama" class="block mb-1 text-slate-600">Nama</label>
			<input id="nama" type="text" name="nama" value={data.user.nama} class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs" />
		</div>
		<div>
			<label for="role" class="block mb-1 text-slate-600">Peran</label>
			<input id="role" type="text" disabled class="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs text-slate-600" value={data.user.role} />
		</div>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			<div>
				<label for="nis" class="block mb-1 text-slate-600">NIS / NIP</label>
				<input id="nis" type="text" name="nis" value={data.user.nis ?? ''} class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs" />
			</div>
			<div>
				<label for="kelas" class="block mb-1 text-slate-600">Kelas</label>
				<input id="kelas" type="text" name="kelas" value={data.user.kelas ?? ''} class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs" />
			</div>
		</div>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			<div>
				<label for="email" class="block mb-1 text-slate-600">Email</label>
				<input id="email" type="email" name="email" value={data.user.email ?? ''} class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs" />
			</div>
			<div>
				<label for="telepon" class="block mb-1 text-slate-600">Telepon</label>
				<input id="telepon" type="text" name="telepon" value={data.user.telepon ?? ''} class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs" />
			</div>
		</div>
		<div>
			<label for="password" class="block mb-1 text-slate-600">Password Baru</label>
			<input id="password" type="password" name="password" class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs" placeholder="Kosongkan jika tidak diubah" />
		</div>
		<button type="submit" class="mt-1 inline-flex items-center rounded-lg bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-700">
			Simpan Perubahan
		</button>
	</form>
</div>
