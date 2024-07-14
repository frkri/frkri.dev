<script lang="ts">
	import { CanvasMode, type Path } from '$lib/types/doodle';
	import { type StrokeOptions } from 'perfect-freehand';
	import { getPath } from './Canvas';
	import { page } from '$app/stores';
	import { tick } from 'svelte';

	const STORAGE_KEY = 'doodle';
	const STORAGE_SAVE_TIMEOUT = 1000;

	const PENCIL_MAX_RADIUS = 30;
	const PENCIL_MIN_RADIUS = 1;
	const PENCIL_DEFAULT_RADIUS = 5;

	const DOTS_SIZE = 3;
	const DOTS_SHOW_RADIUS = 300;

	const CANVAS_MAX_WIDTH = 4500;
	let canvasLeftEdge: number;
	let canvasRightEdge: number;

	let canvas: HTMLCanvasElement;
	let dots: HTMLDivElement;
	let ctx: CanvasRenderingContext2D;

	let { mode, color }: { mode: CanvasMode; color: string } = $props();
	let pencilRadius = $state(PENCIL_DEFAULT_RADIUS);
	let strokeStyle: StrokeOptions = $derived({
		size: pencilRadius * 2,
		thinning: 0.5,
		smoothing: 0.8,
		streamline: 0.8,
		start: {
			cap: true
		},
		end: {
			cap: true
		}
	});

	/**
	 * Current temporary points that are being drawn on the canvas
	 */
	let points: number[][] = [];
	/**
	 * The paths that are complete and drawn on the canvas
	 */
	let paths: Path[] = [];

	$effect(() => {
		const context = canvas.getContext('2d');
		if (!context) {
			console.warn('Failed to get canvas context ):');
			return;
		}
		ctx = context;

		// Load the saved canvas
		if (paths.length === 0)
			paths = JSON.parse(localStorage.getItem(STORAGE_KEY + $page.url.pathname) || '[]');

		// Will indirectly redraw the canvas
		handleResize();
	});

	async function handleResize() {
		const dpr = window.devicePixelRatio;
		const width = window.innerWidth;
		// Where 80 is the top margin of the body
		const height = document.body.scrollHeight + 80;

		// Resize the cursor based on the pencil radius and device pixel ratio
		canvas.style.cursor = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='${PENCIL_MAX_RADIUS * 4}' height='${PENCIL_MAX_RADIUS * 4}' fill='${mode === CanvasMode.DRAW ? color.replace('#', '%23') : '%23FFFFFF'}AA'><circle cx='${(PENCIL_MAX_RADIUS * 4) / 2}' cy='${(PENCIL_MAX_RADIUS * 4) / 2}' r='${pencilRadius * window.devicePixelRatio}'></circle></svg>") 60 60, auto`;

		// Dots size
		dots.style.height = height + 'px';

		// Canvas size
		canvas.width = width * dpr;
		canvas.height = height * dpr;

		canvas.style.width = width + 'px';
		canvas.style.height = height + 'px';
		ctx.scale(dpr, dpr);

		// Wait for the dom to update
		tick().then(() => {
			// Canvas bounds
			const windowMiddle = window.innerWidth / 2;
			canvasLeftEdge = windowMiddle - CANVAS_MAX_WIDTH / 2;
			canvasRightEdge = windowMiddle + CANVAS_MAX_WIDTH / 2;

			// Redraw and reset the canvas
			points = [];
			redrawCanvas();
		});
	}

	async function redrawCanvas(deletedPaths?: Path[]) {
		// Either redraw all the paths or the given deleted paths only
		const selectedPaths = deletedPaths || paths;
		selectedPaths.forEach((localPath) => {
			const localStrokeStyle = { ...strokeStyle, size: localPath.width * 2 };
			const pathPoints = localPath.points.map(([x, y, pressure]) => [
				x + canvasLeftEdge,
				y,
				pressure
			]);
			const path = getPath(pathPoints, localStrokeStyle);

			if (deletedPaths) {
				ctx.globalCompositeOperation = 'destination-out';
				ctx.fillStyle = localPath.color + 'CC';
			} else {
				ctx.fillStyle = localPath.color;
			}
			ctx.fill(path);
			if (deletedPaths) ctx.globalCompositeOperation = 'source-over';
		});
	}

	async function handleKey(e: KeyboardEvent) {
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

	async function handlePointer(e: PointerEvent) {
		const x = e.pageX;
		const y = e.pageY;

		// Show the border when the cursor is near the canvas edges
		dots.style.borderLeftWidth = x < canvasLeftEdge ? '40px' : '0px';
		dots.style.borderRightWidth = x > canvasRightEdge ? '40px' : '0px';

		// Allow movement only within the canvas bounds
		if (x < canvasLeftEdge || x > canvasRightEdge) return;
		updateDotsGrid(x, y);

		// Only draw when the primary button is pressed
		if (e.buttons === 1) updateCanvas(x, y, e.pressure);
	}

	let saveCanvasTimeout: number | undefined = undefined;
	async function handlePointerUp() {
		if (mode === CanvasMode.DRAW && points.length > 0) {
			// Translate the points to the canvas bounds, enabling the canvas to resized without displacing the doodle
			const transformedPoints = points.map(([x, y, pressure]) => [x - canvasLeftEdge, y, pressure]);
			paths.push({ color, width: pencilRadius, points: transformedPoints });
		}

		points = [];
		clearInterval(saveCanvasTimeout);
		saveCanvasTimeout = setTimeout(saveCanvas, STORAGE_SAVE_TIMEOUT) as unknown as number;
	}

	async function updateDotsGrid(x: number, y: number) {
		// Create a radial gradient mask that only shows the background (grid of dots) near the cursor position
		dots.style.background = `radial-gradient(circle ${DOTS_SHOW_RADIUS}px at ${x}px ${y}px, transparent 0%, var(--background-primary)),
		url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%23FFFFFF55"><circle cx="50" cy="50" r="${DOTS_SIZE}"></circle></svg>') center center`;
	}

	async function updateCanvas(x: number, y: number, pressure: number) {
		// Draw or erase the canvas based on the mouse position
		if (mode === CanvasMode.DRAW) {
			points.push([x, y, pressure]);
			const path = getPath(points, strokeStyle);

			ctx.fillStyle = color;
			ctx.fill(path);
		} else if (mode === CanvasMode.ERASE) {
			// Find the paths that are overlapping with the cursor position
			const overlappingPaths = paths.filter((path) =>
				path.points.some(
					([px, py]) =>
						Math.abs(px + canvasLeftEdge - x) < pencilRadius * 2 &&
						Math.abs(py - y) < pencilRadius * 2
				)
			);

			if (overlappingPaths.length === 0) return;
			paths = paths.filter((path) => !overlappingPaths.includes(path));
			redrawCanvas(overlappingPaths);
		}
	}

	async function saveCanvas() {
		localStorage.setItem(STORAGE_KEY + $page.url.pathname, JSON.stringify(paths));
	}
</script>

<svelte:window onkeydown={handleKey} onresize={handleResize} />
<div class="wrapper" class:hidden={mode === CanvasMode.IDLE}>
	<canvas
		bind:this={canvas}
		onpointermove={handlePointer}
		onpointerdown={handlePointer}
		onpointerup={handlePointerUp}
		onpointerleave={handlePointerUp}
	>
	</canvas>
	<div id="dots" bind:this={dots} aria-hidden="true"></div>
</div>

<style>
	.wrapper * {
		position: absolute;
		top: 0;
		left: 0;

		overflow: hidden;
		transition: opacity 150ms ease-in-out;
	}

	canvas {
		z-index: 1;
		opacity: 1;

		touch-action: none;
		pointer-events: all;
	}

	#dots {
		width: 100%;

		transition-property: border;
		border: 0px solid #ffffff44;

		z-index: -5;
		pointer-events: none;
	}

	.hidden * {
		z-index: -5;
		opacity: 0.05;

		pointer-events: none;
		background: none !important;
		border: none !important;
	}
</style>
