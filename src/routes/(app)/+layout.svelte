<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	const year = new Date().getFullYear();
</script>

<Header />

<main class="max-w-6xl mx-auto px-4 py-6">
	{@render children()}
</main>

<footer class="border-t border-slate-200 mt-8">
	<div class="max-w-6xl mx-auto px-4 py-4 text-xs text-slate-500 flex justify-between">
		<span>&copy; {year} BK MAN 1 Jember</span>
		<span>Layanan BK digital untuk siswa dan guru</span>
	</div>
</footer>
