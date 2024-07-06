<script lang="ts">
	import { CanvasMode } from '$lib/types/doodle';

	const MAX_RADIUS = 10;
	const DEFAULT_RADIUS = MAX_RADIUS / 2;
	const MIN_RADIUS = 1;

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let {
		mode = $bindable(CanvasMode.IDLE),
		color = $bindable('#FFFFFF')
	}: { mode: CanvasMode; color: string } = $props();

	$effect(() => {
		let context = canvas.getContext('2d');
		if (context) ctx = context;

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		ctx.fillStyle = color;
	});

	let cursorRadius = $state(DEFAULT_RADIUS);
	let cursorStyle = $derived.by(() => {
		if (mode === CanvasMode.DRAW) {
			return `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='${MAX_RADIUS * 2}' height='${MAX_RADIUS * 2}' fill='${color.replace('#', '%23')}AA'><circle cx='${(MAX_RADIUS * 2) / 2}' cy='${(MAX_RADIUS * 2) / 2}' r='${cursorRadius}'></circle></svg>") 16 16, auto`;
		} else {
			return 'default';
		}
	});

	function handleKey(e: KeyboardEvent) {
		if (e.ctrlKey) return;
		switch (e.key) {
			case '+':
				cursorRadius = Math.min(cursorRadius + 1, MAX_RADIUS);
				break;
			case '-':
				cursorRadius = Math.max(cursorRadius - 1, MIN_RADIUS);
				break;
			case '=':
				cursorRadius = DEFAULT_RADIUS;
				break;
		}
	}

	function handleMouseMove(e: MouseEvent) {
		if (e.buttons !== 1 || mode === CanvasMode.IDLE) return;

		if (mode === CanvasMode.DRAW) {
			console.log('draw');
		} else if (mode === CanvasMode.ERASE) {
			console.log('erase');
		}
	}
</script>

<svelte:window onkeydown={handleKey} />
<canvas
	bind:this={canvas}
	onmousemove={handleMouseMove}
	class:none={mode === CanvasMode.IDLE}
	style="cursor: {cursorStyle};"
>
</canvas>

<style>
	canvas {
		position: fixed;
		top: 0;
		left: 0;

		width: 100%;
		height: 100%;

		z-index: 1;
	}

	.none {
		opacity: 0.4;
		z-index: -1;
	}
</style>
