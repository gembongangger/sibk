<script lang="ts">
	import { page } from '$app/stores';
	import {
		LayoutDashboard,
		ClipboardList,
		CalendarDays,
		BarChart3,
		Users,
		UserCircle,
		LogOut,
		Menu,
		X,
		ChevronLeft,
		ChevronRight
	} from '@lucide/svelte';

	let { children }: { children: import('svelte').Snippet } = $props();

	const year = new Date().getFullYear();

	const links: { href: string; label: string; icon: typeof LayoutDashboard; roles: string[] }[] = [
		{ href: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'guru', 'siswa'] },
		{ href: '/requests', label: 'Permohonan', icon: ClipboardList, roles: ['admin', 'guru'] },
		{ href: '/sessions', label: 'Sesi', icon: CalendarDays, roles: ['admin', 'guru'] },
		{ href: '/reports', label: 'Laporan', icon: BarChart3, roles: ['admin', 'guru'] },
		{ href: '/users', label: 'Pengguna', icon: Users, roles: ['admin'] }
	];

	const role = $derived($page.data.user?.role ?? 'siswa');
	const visible = $derived(links.filter((l) => l.roles.includes(role)));
	const currentPath = $derived($page.url.pathname);

	let mobileOpen = $state(false);
	let collapsed = $state(false);

	$effect(() => {
		collapsed = localStorage.getItem('sidebar-collapsed') === '1';
	});

	$effect(() => {
		localStorage.setItem('sidebar-collapsed', collapsed ? '1' : '0');
	});

	function isActive(href: string): boolean {
		return currentPath === href || currentPath.startsWith(href + '/');
	}
</script>

<div class="md:hidden sticky top-0 z-[60] flex h-14 items-center justify-between px-4 bg-white/85 backdrop-blur-md border-b border-slate-200/70 print:hidden">
	<a href="/" class="flex items-center gap-2.5">
		<img src="/logo.png" alt="Logo MAN 1 Jember" class="h-8 w-8 rounded-full ring-1 ring-slate-200" />
		<span class="text-sm font-semibold tracking-tight text-slate-900">BK MAN 1 Jember</span>
	</a>
	<button
		type="button"
		onclick={() => (mobileOpen = !mobileOpen)}
		aria-label="Buka menu"
		aria-expanded={mobileOpen}
		class="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition"
	>
		{#if mobileOpen}
			<X size={18} strokeWidth={2} />
		{:else}
			<Menu size={18} strokeWidth={2} />
		{/if}
	</button>
</div>

{#if mobileOpen}
	<button
		type="button"
		aria-label="Tutup menu"
		onclick={() => (mobileOpen = false)}
		class="md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
	></button>
{/if}

<aside
	class="print:hidden group/sidebar fixed left-0 bottom-0 top-14 md:top-0 z-50 flex w-64 flex-col bg-white border-r border-slate-200/70 shadow-2xl shadow-slate-900/10 md:shadow-none {mobileOpen
		? ''
		: 'drawer-closed'} {collapsed
		? 'md:w-[4.5rem]'
		: ''}"
>
	<div class="relative hidden md:flex items-center gap-3 h-16 shrink-0 border-b border-slate-100 px-5 {collapsed ? 'md:px-4 md:justify-center' : ''}">
		<img src="/logo.png" alt="Logo MAN 1 Jember" class="h-9 w-9 shrink-0 rounded-full ring-1 ring-slate-200" />
		<div class="leading-tight min-w-0 whitespace-nowrap {collapsed ? 'md:hidden' : ''}">
			<div class="text-sm font-semibold tracking-tight text-slate-900">BK MAN 1 Jember</div>
			<div class="text-[11px] text-slate-400">Bimbingan dan Konseling</div>
		</div>
		<button
			type="button"
			onclick={() => (collapsed = !collapsed)}
			aria-label={collapsed ? 'Buka sidebar' : 'Ciutkan sidebar'}
			class="hidden md:inline-flex absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm opacity-0 group-hover/sidebar:opacity-100 focus-visible:opacity-100 transition hover:text-primary-600 hover:border-primary-200"
		>
			{#if collapsed}
				<ChevronRight size={14} strokeWidth={2.5} />
			{:else}
				<ChevronLeft size={14} strokeWidth={2.5} />
			{/if}
		</button>
	</div>

	<nav class="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-1">
		<p class="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap {collapsed ? 'md:hidden' : ''}">Menu</p>
		{#each [...visible, { href: '/profile', label: 'Profil', icon: UserCircle }] as link (link.href)}
			<a
				href={link.href}
				title={link.label}
				onclick={() => (mobileOpen = false)}
				class="flex items-center gap-2.5 rounded-xl py-2.5 text-sm font-medium transition whitespace-nowrap {collapsed
					? 'md:justify-center md:px-0'
					: 'px-3'} {isActive(link.href)
					? 'bg-primary-50 text-primary-700'
					: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}"
			>
				<link.icon size={17} strokeWidth={2} class="shrink-0 {isActive(link.href) ? 'text-primary-600' : 'text-slate-400'}" />
				<span class="{collapsed ? 'md:hidden' : ''}">{link.label}</span>
			</a>
		{/each}
	</nav>

	{#if $page.data.user}
		<div class="shrink-0 border-t border-slate-100 p-3">
			<div class="flex items-center gap-2.5 rounded-xl bg-slate-50 py-2.5 {collapsed ? 'md:justify-center md:px-0' : 'px-3'}">
				<div class="h-9 w-9 shrink-0 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold uppercase" title={$page.data.user.nama}>
					{$page.data.user.nama.slice(0, 2)}
				</div>
				<div class="min-w-0 leading-tight whitespace-nowrap {collapsed ? 'md:hidden' : ''}">
					<div class="truncate text-xs font-semibold text-slate-800">{$page.data.user.nama}</div>
					<div class="text-[11px] capitalize text-slate-400">{$page.data.user.role}</div>
				</div>
			</div>
			<form method="POST" action="/logout" class="mt-2">
				<button
					title="Keluar"
					class="flex w-full items-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 {collapsed
						? 'md:justify-center'
						: 'justify-center'}"
				>
					<LogOut size={14} strokeWidth={2} />
					<span class="{collapsed ? 'md:hidden' : ''}">Keluar</span>
				</button>
			</form>
		</div>
	{/if}
</aside>

<div class="transition-[padding] duration-200 ease-out min-h-screen flex flex-col pl-0 {collapsed ? 'md:pl-[4.5rem]' : 'md:pl-64'}">
	<main class="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
		{@render children()}
	</main>

	<footer class="border-t border-slate-200/70 mt-12 print:hidden">
		<div class="max-w-6xl mx-auto px-4 py-5 text-[11px] text-slate-400 flex flex-col sm:flex-row justify-between gap-1.5">
			<span>&copy; {year} BK MAN 1 Jember</span>
			<span>Layanan Bimbingan dan Konseling digital untuk siswa dan guru</span>
		</div>
	</footer>
</div>

<style>
	aside {
		will-change: transform;
		transition: transform 0.2s ease-out;
	}

	@media (max-width: 767.98px) {
		aside.drawer-closed {
			transform: translateX(-100%);
		}
	}
</style>
