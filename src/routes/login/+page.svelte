<script lang="ts">
	import { page } from '$app/stores';
	import { Eye, EyeOff, Lock, Loader2, User, CalendarCheck, HeartHandshake, ShieldCheck } from '@lucide/svelte';

	let showPass = $state(false);
	let submitting = $state(false);
</script>

<main class="relative min-h-screen overflow-hidden bg-slate-50 flex items-center justify-center px-4 py-10">
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="absolute -top-28 -left-28 h-96 w-96 rounded-full bg-primary-300/30 blur-3xl animate-blob"></div>
		<div class="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl animate-blob-slow"></div>
		<div class="absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-primary-100/50 blur-3xl animate-blob"></div>
	</div>

	<div class="relative max-w-5xl w-full animate-fade-in-up">
		<div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-primary-900/10">
			<div class="grid md:grid-cols-2">
				<aside class="relative hidden md:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 p-10 text-white">
					<div class="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true"></div>
					<div class="pointer-events-none absolute bottom-10 -left-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" aria-hidden="true"></div>

					<div class="relative">
						<div class="flex items-center gap-3">
							<img src="/logo.png" alt="Logo MAN 1 Jember" class="h-14 w-14 rounded-2xl bg-white/90 p-1 shadow-lg" />
							<div>
								<div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-200">MAN 1 Jember</div>
								<div class="text-lg font-bold">Sistem Bimbingan Konseling</div>
							</div>
						</div>
					</div>

					<div class="relative py-6">
						<h1 class="text-3xl font-bold leading-tight">Layanan konseling, lebih terarah &amp; terjadwal</h1>
						<p class="mt-3 text-sm leading-relaxed text-primary-100">
							Ajukan permohonan, pilih guru BK, dan pantau sesi konseling Anda langsung dari satu tempat.
						</p>
					</div>

					<div class="relative space-y-3">
						{#each [
							{ icon: CalendarCheck, text: 'Booking sesi konseling dengan guru BK secara online' },
							{ icon: HeartHandshake, text: 'Layanan pribadi, sosial, belajar, dan karier' },
							{ icon: ShieldCheck, text: 'Riwayat konseling tercatat aman & rahasia' }
						] as f (f.text)}
							<div class="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm backdrop-blur">
								<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15">
									<f.icon size={16} />
								</div>
								<span class="text-primary-50">{f.text}</span>
							</div>
						{/each}
					</div>
				</aside>

				<section class="flex flex-col justify-center p-8 sm:p-10">
					<div class="mb-6 md:hidden">
						<div class="flex items-center gap-3">
							<img src="/logo.png" alt="Logo MAN 1 Jember" class="h-12 w-12 rounded-full ring-2 ring-primary-100" />
							<div>
								<div class="font-semibold text-slate-900">MAN 1 Jember</div>
								<div class="text-xs text-slate-500">Sistem Bimbingan Konseling</div>
							</div>
						</div>
					</div>

					<h1 class="text-xl font-bold text-slate-900">Selamat datang kembali</h1>
					<p class="mt-1 text-sm text-slate-500">Silakan masuk untuk mengakses layanan BK.</p>

					{#if $page.form?.error}
						<div class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
							{$page.form.error}
						</div>
					{/if}

					<form method="POST" onsubmit={() => (submitting = true)} class="mt-6 space-y-4">
						<div>
							<label for="username" class="mb-1.5 block text-xs font-medium text-slate-600">Username</label>
							<div class="relative">
								<User size={16} strokeWidth={2} class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
								<input
									id="username"
									type="text"
									name="username"
									value={$page.form?.username ?? ''}
									placeholder="contoh: admin"
									autocomplete="username"
									class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
								/>
							</div>
						</div>

						<div>
							<label for="password" class="mb-1.5 block text-xs font-medium text-slate-600">Password</label>
							<div class="relative">
								<Lock size={16} strokeWidth={2} class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
								<input
									id="password"
									type={showPass ? 'text' : 'password'}
									name="password"
									placeholder="password login"
									autocomplete="current-password"
									class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
								/>
								<button
									type="button"
									aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
									onclick={() => (showPass = !showPass)}
									class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:text-slate-600"
								>
									{#if showPass}
										<EyeOff size={16} />
									{:else}
										<Eye size={16} />
									{/if}
								</button>
							</div>
						</div>

						<button
							type="submit"
							disabled={submitting}
							class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
						>
							{#if submitting}
								<Loader2 size={16} class="animate-spin" />
							{/if}
							{submitting ? 'Memproses...' : 'Masuk'}
						</button>
					</form>

					<p class="mt-6 text-center text-sm text-slate-500">
						Belum punya akun? Siswa dapat
						<a href="/register" class="font-semibold text-primary-700 underline-offset-2 hover:underline">mendaftar di sini</a>.
					</p>
				</section>
			</div>
		</div>

		<p class="mt-5 text-center text-xs text-slate-400">&copy; {new Date().getFullYear()} BK MAN 1 Jember</p>
	</div>
</main>