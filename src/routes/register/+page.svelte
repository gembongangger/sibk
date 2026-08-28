<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { Loader2 } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();
	let submitting = $state(false);
	let hydrated = $state(false);

	$effect(() => {
		hydrated = true;
	});
</script>

<main class="relative min-h-screen overflow-hidden bg-slate-50 flex items-center justify-center px-4 py-10">
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="absolute -top-28 -left-28 h-96 w-96 rounded-full bg-primary-300/30 blur-3xl animate-blob"></div>
		<div class="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl animate-blob-slow"></div>
		<div class="absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-primary-100/50 blur-3xl animate-blob"></div>
	</div>

	<div class="relative max-w-md w-full animate-fade-in-up">
		<div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-primary-900/10 sm:p-8">
			<div class="mb-6 flex flex-col items-center gap-3">
				<div class="flex h-16 w-16 items-center justify-center rounded-full ring-2 ring-primary-100">
					<img src="/logo.png" alt="Logo MAN 1 Jember" class="h-14 w-14 rounded-full" />
				</div>
				<div class="text-center">
					<div class="text-xs font-semibold uppercase tracking-wide text-primary-600">MAN 1 Jember</div>
					<h1 class="text-lg font-bold text-slate-900">Pendaftaran Siswa</h1>
					<p class="text-xs text-slate-500 mt-1">Buat akun untuk mengakses layanan BK.</p>
				</div>
			</div>

			{#if $page.form?.error}
				<div class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
					{$page.form.error}
				</div>
			{/if}

			{#if hydrated}
			<form method="POST" onsubmit={() => (submitting = true)} class="space-y-3">
				<div>
					<label for="nama" class="mb-1.5 block text-xs font-medium text-slate-600">Nama Lengkap</label>
					<input
						id="nama"
						type="text"
						name="nama"
						value={$page.form?.form?.nama ?? ''}
						placeholder="contoh: Ahmad Fauzi"
						class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
					/>
				</div>

				<div class="grid grid-cols-3 gap-2">
					<div>
						<label for="kelas_tingkat" class="mb-1.5 block text-xs font-medium text-slate-600">Tingkat</label>
						<select id="kelas_tingkat" name="kelas_tingkat" class="w-full rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800 transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
							<option value="">-</option>
							{#each data.kelasConfig.tingkat as k}
								<option value={k} selected={k === ($page.form?.form?.kelasTingkat ?? '')}>{k}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="kelas_program" class="mb-1.5 block text-xs font-medium text-slate-600">Program</label>
						<select id="kelas_program" name="kelas_program" class="w-full rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800 transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
							<option value="">-</option>
							{#each data.kelasConfig.program as k}
								<option value={k} selected={k === ($page.form?.form?.kelasProgram ?? '')}>{k}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="kelas_nomor" class="mb-1.5 block text-xs font-medium text-slate-600">Nomor</label>
						<select id="kelas_nomor" name="kelas_nomor" class="w-full rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800 transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
							<option value="">-</option>
							{#each data.kelasConfig.nomor as k}
								<option value={k} selected={k === ($page.form?.form?.kelasNomor ?? '')}>{k}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-2">
					<div>
						<label for="nis" class="mb-1.5 block text-xs font-medium text-slate-600">NIS</label>
						<input
							id="nis"
							type="text"
							name="nis"
							value={$page.form?.form?.nis ?? ''}
							placeholder="contoh: 12345"
							class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
						/>
					</div>
					<div>
						<label for="angkatan" class="mb-1.5 block text-xs font-medium text-slate-600">Angkatan</label>
						<select id="angkatan" name="angkatan" class="w-full rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800 transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
							<option value="">-</option>
							{#each data.angkatanOptions as a}
								<option value={a} selected={a === Number($page.form?.form?.angkatan)}>{a}</option>
							{/each}
						</select>
					</div>
				</div>

				<div>
					<label for="username" class="mb-1.5 block text-xs font-medium text-slate-600">Username</label>
					<input
						id="username"
						type="text"
						name="username"
						value={$page.form?.form?.username ?? ''}
						placeholder="contoh: ahmad_fauzi"
						autocomplete="username"
						class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
					/>
				</div>

				<div class="grid grid-cols-2 gap-2">
					<div>
						<label for="email" class="mb-1.5 block text-xs font-medium text-slate-600">Email</label>
						<input
							id="email"
							type="email"
							name="email"
							value={$page.form?.form?.email ?? ''}
							placeholder="opsional"
							class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
						/>
					</div>
					<div>
						<label for="telepon" class="mb-1.5 block text-xs font-medium text-slate-600">Telepon</label>
						<input
							id="telepon"
							type="text"
							name="telepon"
							value={$page.form?.form?.telepon ?? ''}
							placeholder="opsional"
							class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
						/>
					</div>
				</div>

				<div>
					<label for="password" class="mb-1.5 block text-xs font-medium text-slate-600">Password</label>
					<input
						id="password"
						type="password"
						name="password"
						placeholder="minimal 6 karakter"
						autocomplete="new-password"
						class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
					/>
				</div>

				<button
					type="submit"
					disabled={submitting}
					class="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
				>
					{#if submitting}
						<Loader2 size={16} class="animate-spin" />
					{/if}
					{submitting ? 'Memproses...' : 'Daftar'}
				</button>
			</form>
			{:else}
				<div
					class="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500"
					role="status"
				>
					<Loader2 size={16} class="animate-spin" />
					Menyiapkan formulir pendaftaran&hellip;
				</div>
			{/if}

			<p class="mt-4 text-center text-sm text-slate-500">
				Sudah punya akun?
				<a href="/login" class="font-semibold text-primary-700 underline-offset-2 hover:underline">Masuk</a>
			</p>
		</div>
		<p class="mt-4 text-center text-xs text-slate-400">&copy; {new Date().getFullYear()} BK MAN 1 Jember</p>
	</div>
</main>