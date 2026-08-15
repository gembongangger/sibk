<script lang="ts">
	let {
		rating,
		size = 'text-base'
	}: { rating: number; size?: string } = $props();
</script>

<div class="inline-flex items-center gap-0.5 {size}" aria-label="Rating {rating} dari 5">
	{#each [1, 2, 3, 4, 5] as value}
		<span class={value <= rating ? 'text-amber-400' : 'text-slate-300'}>★</span>
	{/each}
</div>
