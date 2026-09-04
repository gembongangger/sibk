<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

{@render children()}

<svelte:head>
	<title>SIBK MAN 1 Jember</title>
</svelte:head>
