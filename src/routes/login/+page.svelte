<script lang="ts">
	import { page } from '$app/stores';
</script>

<main class="min-h-screen bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 flex items-center justify-center px-4">
	<div class="max-w-md w-full">
		<div class="bg-white/10 backdrop-blur rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8">
			<div class="flex flex-col items-center gap-3 mb-6">
				<img src="/logo.png" alt="Logo MAN 1 Jember" class="h-16 w-16 rounded-full bg-white/80 p-1" />
				<div class="text-center">
					<div class="text-sm text-primary-100 tracking-wide">MAN 1 Jember</div>
					<h1 class="text-xl font-semibold text-white tracking-tight">Sistem Bimbingan Konseling</h1>
					<p class="text-xs text-primary-100 mt-1">Silakan login untuk mengakses layanan BK.</p>
				</div>
			</div>

			{#if $page.form?.error}
				<div class="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs text-red-50">
					{$page.form.error}
				</div>
			{/if}

			<form method="POST" class="space-y-4">
				<div>
					<label for="username" class="block text-xs font-medium text-primary-50 mb-1.5">Username</label>
					<input
						id="username"
						type="text"
						name="username"
						value={$page.form?.username ?? ''}
						class="w-full rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-primary-100 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
						placeholder="contoh: admin"
						autocomplete="username"
					/>
				</div>
				<div>
					<label for="password" class="block text-xs font-medium text-primary-50 mb-1.5">Password</label>
					<input
						id="password"
						type="password"
						name="password"
						class="w-full rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-primary-100 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
						placeholder="password login"
						autocomplete="current-password"
					/>
				</div>
				<button
					type="submit"
					class="w-full mt-2 inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary-700 shadow-lg shadow-black/10 hover:bg-primary-50 active:scale-[0.99] transition"
				>
					Masuk
				</button>
			</form>

			<p class="mt-4 text-sm text-primary-100 text-center leading-snug">
				Akun awal: username <span class="font-semibold">admin</span>, password <span class="font-semibold">admin123</span>.
				Password dapat diubah setelah login.
			</p>
		</div>
		<p class="mt-4 text-xs text-primary-100 text-center">&copy; {new Date().getFullYear()} BK MAN 1 Jember</p>
	</div>
</main>
