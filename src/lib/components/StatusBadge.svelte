<script lang="ts">
	import { STATUS_LABEL, STATUS_STYLE } from '$lib/utils';

	let { status }: { status: string } = $props();
</script>

<span
	class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium {STATUS_STYLE[status] ?? 'bg-slate-50 text-slate-600'}"
>
	{STATUS_LABEL[status] ?? status}
</span>
