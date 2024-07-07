<script lang="ts">
	import { CanvasMode } from '$lib/types/doodle';
	import { getStroke } from 'perfect-freehand';
	import { getSvgPathFromStroke } from './Canvas';

	const PENCIL_MAX_RADIUS = 20;
	const PENCIL_MIN_RADIUS = 1;
	const PENCIL_DEFAULT_RADIUS = PENCIL_MAX_RADIUS / 2;

	const DOTS_SIZE = 3;
	const DOTS_SHOW_RADIUS = 500;

	let canvas: HTMLCanvasElement;
	let dots: HTMLDivElement;
	let ctx: CanvasRenderingContext2D;

	let { mode = $bindable(), color = $bindable() }: { mode: CanvasMode; color: string } = $props();
	let pencilRadius = $state(PENCIL_DEFAULT_RADIUS);
	let pencilStyle = $derived.by(() => {
		if (mode === CanvasMode.DRAW || mode === CanvasMode.ERASE)
			return `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='${PENCIL_MAX_RADIUS * 2}' height='${PENCIL_MAX_RADIUS * 2}' fill='${mode === CanvasMode.DRAW ? color.replace('#', '%23') : '%23FFFFFFAA'}AA'><circle cx='${(PENCIL_MAX_RADIUS * 2) / 2}' cy='${(PENCIL_MAX_RADIUS * 2) / 2}' r='${pencilRadius}'></circle></svg>") 16 16, auto`;
		return 'default';
	});
	let points: number[][] = $state([]);

	$effect(() => {
		const dpr = window.devicePixelRatio;
		canvas.width = window.innerWidth * dpr;
		canvas.height = window.innerHeight * dpr;

		const context = canvas.getContext('2d');
		if (!context) {
			console.warn('Failed to get canvas context ):');
			return;
		}

		ctx = context;
		ctx.scale(dpr, dpr);
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

		// Create a radial gradient mask that only shows the dots near the cursor position
		dots.style.background = `radial-gradient(circle ${DOTS_SHOW_RADIUS}px at ${e.pageX}px ${e.pageY}px, transparent 0%, var(--background-primary)),
		url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%23FFFFFF44"><circle cx="50" cy="50" r="${DOTS_SIZE}"></circle></svg>') center center`;

		handleMouseDown(e);
	}

	function handleMouseDown(e: MouseEvent) {
		console.log('Mouse down', e.buttons);
		act(e.buttons === 1, e.pageX, e.pageY);
	}

	function handleTouchEnd(e: TouchEvent) {
		act(false, 0, 0);
	}

	function handleTouchMove(e: TouchEvent) {
		let first = e.touches[0];
		act(true, first.pageX, first.pageY);
	}

	function act(isDrawing: boolean, x: number, y: number) {
		if (mode === CanvasMode.IDLE) return;

		// Clear the current points if the mouse button is released
		if (!isDrawing) {
			if (points.length > 0) points = [];
			return;
		}

		// Limit the number of points to prevent performance issues
		if (points.length > 2000) points = points.slice(1000);

		// Draw or erase the canvas based on the mouse position
		if (mode === CanvasMode.DRAW) {
			points.push([x, y]);
			const stroke = getStroke(points, {
				size: pencilRadius * 1.2,
				thinning: 0.8,
				smoothing: 0.8,
				streamline: 0.8,
				simulatePressure: true,
				start: {
					cap: true
				},
				end: {
					cap: true
				}
			});

			const svgPath = getSvgPathFromStroke(stroke);
			const path = new Path2D(svgPath);

			ctx.fillStyle = color;
			ctx.fill(path);
		} else if (mode === CanvasMode.ERASE) {
			ctx.globalCompositeOperation = 'destination-out';

			ctx.beginPath();
			ctx.arc(x, y, pencilRadius, 0, 2 * Math.PI);
			ctx.fill();

			ctx.globalCompositeOperation = 'source-over';
		}
	}
</script>

<svelte:window onkeydown={handleKey} />
<div class:hidden={mode === CanvasMode.IDLE}>
	<canvas
		bind:this={canvas}
		ontouchmove={handleTouchMove}
		ontouchend={handleTouchEnd}
		onmousemove={handleMouseMove}
		onmousedown={handleMouseDown}
		style="cursor: {pencilStyle};"
	>
	</canvas>
	<div id="dots" bind:this={dots} aria-hidden="true"></div>
</div>

<style>
	canvas {
		position: fixed;
		top: 0;
		left: 0;

		width: 100%;
		height: 100%;

		transition: all 150ms ease-in-out;
		z-index: 1;
		opacity: 1;

		touch-action: none;
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
		opacity: 0.2;

		pointer-events: none;
		background: none !important;
	}
</style>
