<script lang="ts">
	let { type, children }: { type: 'error' | 'success'; children: import('svelte').Snippet } = $props();
</script>

<div
	class="mb-3 rounded-xl border px-4 py-2 text-xs {type === 'error'
		? 'border-rose-200 bg-rose-50 text-rose-700'
		: 'border-emerald-200 bg-emerald-50 text-emerald-700'}"
>
	{@render children()}
</div>
