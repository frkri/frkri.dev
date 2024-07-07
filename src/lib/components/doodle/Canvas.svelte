<script lang="ts">
	import { CanvasMode } from '$lib/types/doodle';
	const PENCIL_MAX_RADIUS = 10;
	const PENCIL_MIN_RADIUS = 1;
	const PENCIL_DEFAULT_RADIUS = PENCIL_MAX_RADIUS / 2;

	const DOTS_SIZE = 3;
	const DOTS_SHOW_RADIUS = 500;

	let canvas: HTMLCanvasElement;
	let dots: HTMLDivElement;
	let ctx: OffscreenCanvasRenderingContext2D;

	let { mode = $bindable(), color = $bindable() }: { mode: CanvasMode; color: string } = $props();
	let pencilRadius = $state(PENCIL_DEFAULT_RADIUS);
	let pencilStyle = $derived.by(() => {
		if (mode === CanvasMode.DRAW || mode === CanvasMode.ERASE)
			return `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='${PENCIL_MAX_RADIUS * 2}' height='${PENCIL_MAX_RADIUS * 2}' fill='${mode === CanvasMode.DRAW ? color.replace('#', '%23') : '%23FFFFFFAA'}AA'><circle cx='${(PENCIL_MAX_RADIUS * 2) / 2}' cy='${(PENCIL_MAX_RADIUS * 2) / 2}' r='${pencilRadius}'></circle></svg>"), auto`;
		return 'default';
	});

	$effect(() => {
		let context = canvas.transferControlToOffscreen().getContext('2d');
		if (!context) {
			console.warn('Failed to get canvas context ):');
			return;
		}

		ctx = context;
		ctx.fillStyle = color;
	});

	function handleKey(e: KeyboardEvent) {
		if (mode === CanvasMode.IDLE || e.ctrlKey) return;
		switch (e.key) {
			case '+':
				pencilRadius = Math.min(pencilRadius + 1, PENCIL_MAX_RADIUS);
				break;
			case '-':
				pencilRadius = Math.max(pencilRadius - 1, PENCIL_MIN_RADIUS);
				break;
			case '=':
				pencilRadius = PENCIL_DEFAULT_RADIUS;
				break;
		}
	}

	function handleMouseMove(e: MouseEvent) {
		if (mode === CanvasMode.IDLE) return;
		const x = e.clientX;
		const y = e.clientY;

		// Create a radial gradient mask that only shows the dots near the cursor position
		dots.style.background = `radial-gradient(circle ${DOTS_SHOW_RADIUS}px at ${x}px ${y}px, transparent 0%, var(--background-primary)),
		url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%23FFFFFF44"><circle cx="50" cy="50" r="${DOTS_SIZE}"></circle></svg>')
		center center`;

		// Check if right mouse button is pressed
		if (e.buttons !== 1) return;
		if (mode === CanvasMode.DRAW) {
			console.log('draw');
		} else if (mode === CanvasMode.ERASE) {
			console.log('erase');
		}
	}
</script>

<svelte:window onkeydown={handleKey} />
<div class:hidden={mode === CanvasMode.IDLE}>
	<canvas bind:this={canvas} onmousemove={handleMouseMove} style="cursor: {pencilStyle};"> </canvas>
	<div id="dots" bind:this={dots} aria-hidden="true"></div>
</div>

<style>
	canvas {
		position: fixed;
		top: 0;
		left: 0;

		width: 100%;
		height: 100%;

		z-index: 1;
		opacity: 1;
		pointer-events: all;
	}

	#dots {
		position: fixed;
		top: 0;
		left: 0;

		width: 100%;
		height: 100%;

		z-index: -5;
		pointer-events: none;
	}

	.hidden * {
		z-index: -5;
		opacity: 0.4;

		pointer-events: none;
		background: none !important;
	}
</style>
