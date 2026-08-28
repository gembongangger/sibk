<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<main class="min-h-screen bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 flex items-center justify-center px-4 py-8">
	<div class="max-w-md w-full">
		<div class="bg-white/10 backdrop-blur rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8">
			<div class="flex flex-col items-center gap-3 mb-6">
				<img src="/logo.png" alt="Logo MAN 1 Jember" class="h-16 w-16 rounded-full bg-white/80 p-1" />
				<div class="text-center">
					<div class="text-sm text-primary-100 tracking-wide">MAN 1 Jember</div>
					<h1 class="text-xl font-semibold text-white tracking-tight">Pendaftaran Siswa</h1>
					<p class="text-xs text-primary-100 mt-1">Buat akun untuk mengakses layanan BK.</p>
				</div>
			</div>

			{#if $page.form?.error}
				<div class="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs text-red-50">
					{$page.form.error}
				</div>
			{/if}

			<form method="POST" class="space-y-3">
				<div>
					<label for="nama" class="block text-xs font-medium text-primary-50 mb-1.5">Nama Lengkap</label>
					<input
						id="nama"
						type="text"
						name="nama"
						value={$page.form?.form?.nama ?? ''}
						placeholder="contoh: Ahmad Fauzi"
						class="w-full rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-primary-100 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
					/>
				</div>

				<div class="grid grid-cols-3 gap-2">
					<div>
						<label for="kelas_tingkat" class="block text-xs font-medium text-primary-50 mb-1.5">Tingkat</label>
						<select
							id="kelas_tingkat"
							name="kelas_tingkat"
							class="w-full rounded-xl border border-white/30 bg-white/10 px-2 py-2 text-sm text-white focus:border-white focus:outline-none"
						>
							<option value="">-</option>
							{#each data.kelasConfig.tingkat as k}
								<option value={k} selected={k === ($page.form?.form?.kelasTingkat ?? '')}>{k}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="kelas_program" class="block text-xs font-medium text-primary-50 mb-1.5">Program</label>
						<select
							id="kelas_program"
							name="kelas_program"
							class="w-full rounded-xl border border-white/30 bg-white/10 px-2 py-2 text-sm text-white focus:border-white focus:outline-none"
						>
							<option value="">-</option>
							{#each data.kelasConfig.program as k}
								<option value={k} selected={k === ($page.form?.form?.kelasProgram ?? '')}>{k}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="kelas_nomor" class="block text-xs font-medium text-primary-50 mb-1.5">Nomor</label>
						<select
							id="kelas_nomor"
							name="kelas_nomor"
							class="w-full rounded-xl border border-white/30 bg-white/10 px-2 py-2 text-sm text-white focus:border-white focus:outline-none"
						>
							<option value="">-</option>
							{#each data.kelasConfig.nomor as k}
								<option value={k} selected={k === ($page.form?.form?.kelasNomor ?? '')}>{k}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-2">
					<div>
						<label for="nis" class="block text-xs font-medium text-primary-50 mb-1.5">NIS</label>
						<input
							id="nis"
							type="text"
							name="nis"
							value={$page.form?.form?.nis ?? ''}
							placeholder="contoh: 12345"
							class="w-full rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-primary-100 focus:border-white focus:outline-none"
						/>
					</div>
					<div>
						<label for="angkatan" class="block text-xs font-medium text-primary-50 mb-1.5">Angkatan</label>
						<select
							id="angkatan"
							name="angkatan"
							class="w-full rounded-xl border border-white/30 bg-white/10 px-2 py-2 text-sm text-white focus:border-white focus:outline-none"
						>
							<option value="">-</option>
							{#each data.angkatanOptions as a}
								<option value={a} selected={a === Number($page.form?.form?.angkatan)}>{a}</option>
							{/each}
						</select>
					</div>
				</div>

				<div>
					<label for="username" class="block text-xs font-medium text-primary-50 mb-1.5">Username</label>
					<input
						id="username"
						type="text"
						name="username"
						value={$page.form?.form?.username ?? ''}
						placeholder="contoh: ahmad_fauzi"
						autocomplete="username"
						class="w-full rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-primary-100 focus:border-white focus:outline-none"
					/>
				</div>

				<div class="grid grid-cols-2 gap-2">
					<div>
						<label for="email" class="block text-xs font-medium text-primary-50 mb-1.5">Email</label>
						<input
							id="email"
							type="email"
							name="email"
							value={$page.form?.form?.email ?? ''}
							placeholder="opsional"
							class="w-full rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-primary-100 focus:border-white focus:outline-none"
						/>
					</div>
					<div>
						<label for="telepon" class="block text-xs font-medium text-primary-50 mb-1.5">Telepon</label>
						<input
							id="telepon"
							type="text"
							name="telepon"
							value={$page.form?.form?.telepon ?? ''}
							placeholder="opsional"
							class="w-full rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-primary-100 focus:border-white focus:outline-none"
						/>
					</div>
				</div>

				<div>
					<label for="password" class="block text-xs font-medium text-primary-50 mb-1.5">Password</label>
					<input
						id="password"
						type="password"
						name="password"
						placeholder="minimal 6 karakter"
						autocomplete="new-password"
						class="w-full rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-primary-100 focus:border-white focus:outline-none"
					/>
				</div>

				<button
					type="submit"
					class="w-full mt-1 inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary-700 shadow-lg shadow-black/10 hover:bg-primary-50 active:scale-[0.99] transition"
				>
					Daftar
				</button>
			</form>

			<p class="mt-4 text-sm text-primary-100 text-center leading-snug">
				Sudah punya akun?
				<a href="/login" class="font-semibold text-white underline underline-offset-2 hover:text-primary-50">Masuk</a>
			</p>
		</div>
		<p class="mt-4 text-xs text-primary-100 text-center">&copy; {new Date().getFullYear()} BK MAN 1 Jember</p>
	</div>
</main>