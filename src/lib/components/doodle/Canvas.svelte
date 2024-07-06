<script lang="ts">
	import { CanvasMode } from '$lib/types/doodle';

	let {
		mode = $bindable(CanvasMode.IDLE),
		color = $bindable('#FFFFFF')
	}: { mode: CanvasMode; color: string } = $props();

	let cursor = $derived.by(() => {
		switch (mode) {
			case CanvasMode.DRAW:
				return 'crosshair';
			default:
				return 'default';
		}
	});
</script>

{#if mode !== CanvasMode.IDLE}
	<canvas style="cursor: {cursor};"></canvas>
{/if}

<style>
	canvas {
		position: fixed;
		top: 0;
		left: 0;

		width: 100%;
		height: 100%;

		z-index: 1;
	}
</style>
