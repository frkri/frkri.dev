<script lang="ts">
	import { CanvasMode, type Path } from '$lib/types/doodle';
	import { getStroke, type StrokeOptions } from 'perfect-freehand';
	import { getSvgPathFromStroke } from './Canvas';
	import { page } from '$app/stores';

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

	let { mode = $bindable(), color = $bindable() }: { mode: CanvasMode; color: string } = $props();
	let pencilRadius = $state(PENCIL_DEFAULT_RADIUS);
	let pencilStyle = $derived.by(() => {
		if (mode === CanvasMode.DRAW || mode === CanvasMode.ERASE)
			return `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='${PENCIL_MAX_RADIUS * 2}' height='${PENCIL_MAX_RADIUS * 2}' fill='${mode === CanvasMode.DRAW ? color.replace('#', '%23') : '%23FFFFFF'}AA'><circle cx='${(PENCIL_MAX_RADIUS * 2) / 2}' cy='${(PENCIL_MAX_RADIUS * 2) / 2}' r='${pencilRadius}'></circle></svg>") 30 30, auto`;
		return 'default';
	});
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

	let points: number[][] = [];
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

		// Workaround for to rerender the canvas when mode has changed
		if (mode) return;
	});

	async function handleResize() {
		const dpr = window.devicePixelRatio;
		const width = window.innerWidth;
		const height = document.body.scrollHeight;

		// Dots size
		dots.style.height = height + 'px';

		// Canvas size
		canvas.width = width * dpr;
		canvas.height = height * dpr;

		canvas.style.width = width + 'px';
		canvas.style.height = height + 'px';
		ctx.scale(dpr, dpr);

		// Canvas bounds
		const windowMiddle = window.innerWidth / 2;
		canvasLeftEdge = windowMiddle - CANVAS_MAX_WIDTH / 2;
		canvasRightEdge = windowMiddle + CANVAS_MAX_WIDTH / 2;

		// Redraw and reset the canvas
		points = [];
		redrawCanvas();
	}

	function redrawCanvas() {
		paths.forEach((localPath) => {
			// Apply the path path options
			const localStrokeStyle = { ...strokeStyle, size: localPath.width * 2 };
			const pathPoints = localPath.points.map(([x, y, pressure]) => [
				x + canvasLeftEdge,
				y,
				pressure
			]);

			const stroke = getStroke(pathPoints, localStrokeStyle);
			const svgPath = getSvgPathFromStroke(stroke);
			const path = new Path2D(svgPath);

			ctx.fillStyle = localPath.color;
			ctx.fill(path);
		});
	}

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

	function handlePointer(e: PointerEvent) {
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

	let saveCanvasTimeout: number;
	function handlePointerUp() {
		const transformedPoints = points.map(([x, y, pressure]) => [x - canvasLeftEdge, y, pressure]);
		paths.push({ color, width: pencilRadius, points: transformedPoints });
		points = [];

		clearInterval(saveCanvasTimeout);
		saveCanvasTimeout = setTimeout(saveCanvas, STORAGE_SAVE_TIMEOUT) as unknown as number;
	}

	function updateDotsGrid(x: number, y: number) {
		// Create a radial gradient mask that only shows the dots near the cursor position
		dots.style.background = `radial-gradient(circle ${DOTS_SHOW_RADIUS}px at ${x}px ${y}px, transparent 0%, var(--background-primary)),
		url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%23FFFFFF55"><circle cx="50" cy="50" r="${DOTS_SIZE}"></circle></svg>') center center`;
	}

	function updateCanvas(x: number, y: number, pressure: number) {
		// Draw or erase the canvas based on the mouse position
		if (mode === CanvasMode.DRAW) {
			points.push([x, y, pressure]);
			const stroke = getStroke(points, strokeStyle);
			const svgPath = getSvgPathFromStroke(stroke);
			const path = new Path2D(svgPath);

			ctx.fillStyle = color;
			ctx.fill(path);
		} else if (mode === CanvasMode.ERASE) {
			// todo erase path points
			ctx.globalCompositeOperation = 'destination-out';

			ctx.beginPath();
			ctx.arc(x, y, pencilRadius, 0, 2 * Math.PI);
			ctx.fill();

			ctx.globalCompositeOperation = 'source-over';
		}
	}

	function saveCanvas() {
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
		style="cursor: {pencilStyle};"
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
