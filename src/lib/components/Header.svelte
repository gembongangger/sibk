<script lang="ts">
	import { page } from '$app/stores';

	const links: { href: string; label: string; roles: string[] }[] = [
		{ href: '/', label: 'Dashboard', roles: ['admin', 'guru', 'siswa'] },
		{ href: '/requests', label: 'Permohonan Konseling', roles: ['admin', 'guru'] },
		{ href: '/sessions', label: 'Sesi Konseling', roles: ['admin', 'guru'] },
		{ href: '/reports', label: 'Laporan', roles: ['admin', 'guru'] },
		{ href: '/users', label: 'Pengguna', roles: ['admin'] }
	];

	const role = $derived($page.data.user?.role ?? 'siswa');
	const visible = $derived(links.filter((l) => l.roles.includes(role)));
	const currentPath = $derived($page.url.pathname);

	let menuOpen = $state(false);

	function isActive(href: string): boolean {
		return currentPath === href || currentPath.startsWith(href + '/');
	}
</script>

<header class="bg-gradient-to-r from-primary-700 to-primary-500 text-white shadow-md">
	<div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
		<div class="flex items-center gap-3">
			<img src="/logo.png" alt="Logo MAN 1 Jember" class="h-10 w-10 rounded-full bg-white/10 p-1" />
			<div>
				<div class="font-semibold tracking-tight">BK MAN 1 Jember</div>
				<div class="text-xs text-primary-100">Layanan Bimbingan dan Konseling Terpadu</div>
			</div>
		</div>

		{#if $page.data.user}
			<nav class="hidden md:flex items-center gap-6 text-sm">
				{#each visible as link}
					<a
						href={link.href}
						class={isActive(link.href)
							? 'font-semibold text-white underline underline-offset-4'
							: 'hover:text-primary-100'}
					>
						{link.label}
					</a>
				{/each}
				<a href="/profile" class={isActive('/profile') ? 'font-semibold text-white underline underline-offset-4' : 'hover:text-primary-100'}>
					Profil
				</a>
			</nav>

			<div class="flex items-center gap-3">
				<div class="text-right hidden sm:block">
					<div class="text-xs text-primary-100">Login sebagai</div>
					<div class="text-sm font-semibold">{$page.data.user.nama}</div>
					<div class="text-xs uppercase tracking-wide bg-primary-900/30 px-2 py-0.5 rounded-full inline-block mt-0.5">
						{$page.data.user.role}
					</div>
				</div>
				<form method="POST" action="/logout">
					<button
						class="inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs font-medium hover:bg-white/20"
					>
						Keluar
					</button>
				</form>
				<button
					type="button"
					onclick={() => (menuOpen = !menuOpen)}
					aria-label="Menu navigasi"
					aria-expanded={menuOpen}
					class="md:hidden inline-flex items-center justify-center rounded-lg border border-white/40 bg-white/10 p-1.5 hover:bg-white/20"
				>
					{#if menuOpen}
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					{/if}
				</button>
			</div>
		{/if}
	</div>

	{#if $page.data.user && menuOpen}
		<nav class="md:hidden border-t border-white/15 bg-primary-800/80">
			<div class="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
				<div class="text-[11px] text-primary-100 px-2 pb-1">
					Login sebagai <span class="font-semibold">{$page.data.user.nama}</span> ({$page.data.user.role})
				</div>
				{#each visible as link}
					<a
						href={link.href}
						onclick={() => (menuOpen = false)}
						class={isActive(link.href)
							? 'rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold text-white'
							: 'rounded-lg px-3 py-2 text-sm text-primary-50 hover:bg-white/10'}
					>
						{link.label}
					</a>
				{/each}
				<a
					href="/profile"
					onclick={() => (menuOpen = false)}
					class={isActive('/profile')
						? 'rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold text-white'
						: 'rounded-lg px-3 py-2 text-sm text-primary-50 hover:bg-white/10'}
				>
					Profil
				</a>
			</div>
		</nav>
	{/if}
</header>
