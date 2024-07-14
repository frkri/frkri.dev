<script lang="ts">
	import { CanvasMode, type Path } from '$lib/types/doodle';
	import { type StrokeOptions } from 'perfect-freehand';
	import { page } from '$app/stores';
	import { tick } from 'svelte';
	import CanvasWorker from './Canvas.worker?worker';

	const STORAGE_KEY = 'doodle';
	const STORAGE_MAX_PATHS = 4000;

	const PENCIL_MAX_RADIUS = 30;
	const PENCIL_MIN_RADIUS = 1;
	const PENCIL_DEFAULT_RADIUS = 5;

	const DOTS_SIZE = 3;
	const DOTS_SHOW_RADIUS = 300;

	const CANVAS_MAX_WIDTH = 4500;
	let canvasLeftEdge: number = $state(0);
	let canvasRightEdge: number = $state(0);

	let canvas: HTMLCanvasElement;
	let dots: HTMLDivElement;
	let worker: Worker;

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

	$effect(() => {
		if (!worker) {
			const offscreenCanvas = canvas.transferControlToOffscreen();
			worker = new CanvasWorker();

			worker.onmessage = (e) => {
				const { type, data } = e.data;
				switch (type) {
					case 'saveCanvas':
						saveCanvas(data.paths);
						break;
					default:
						console.warn(`Unhandled message type on main: ${type}`);
				}
			};
			worker.postMessage({ type: 'init', data: { canvas: offscreenCanvas } }, [offscreenCanvas]);

			// Load the saved canvas
			const paths = JSON.parse(localStorage.getItem(STORAGE_KEY + $page.url.pathname) || '[]');
			worker.postMessage({ type: 'updatePaths', data: { paths } });
		}

		// Will indirectly redraw the canvas
		handleResize();
	});

	$effect(() => {
		if (worker)
			worker.postMessage({
				type: 'updateState',
				data: { mode, pencilRadius, color, strokeStyle, canvasLeftEdge }
			});
	});

	let resizeCanvasTimeout: number | undefined = undefined;
	async function scheduleHandleResize() {
		if (mode === CanvasMode.IDLE) {
			clearInterval(resizeCanvasTimeout);
			resizeCanvasTimeout = setTimeout(handleResize, 50) as unknown as number;
		} else {
			handleResize();
		}
	}

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
		canvas.style.width = width + 'px';
		canvas.style.height = height + 'px';
		worker.postMessage({ type: 'resizeCanvas', data: { width, height, dpr } });

		// Wait for the dom to update
		tick().then(() => {
			// Canvas bounds
			const windowMiddle = window.innerWidth / 2;
			canvasLeftEdge = windowMiddle - CANVAS_MAX_WIDTH / 2;
			canvasRightEdge = windowMiddle + CANVAS_MAX_WIDTH / 2;

			// Redraw and reset the canvas
			worker.postMessage({
				type: 'updatePoints',
				data: {
					points: []
				}
			});
			redrawCanvas();
		});
	}

	async function redrawCanvas(deletedPaths?: Path[]) {
		worker.postMessage({
			type: 'redrawCanvas',
			data: { strokeStyle, canvasLeftEdge, deletedPaths }
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
		if (mode === CanvasMode.IDLE) return;
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

	async function handlePointerUp() {
		if (mode === CanvasMode.IDLE) return;
		worker.postMessage({
			type: 'handlePointerUp',
			data: {
				mode
			}
		});
	}

	async function updateDotsGrid(x: number, y: number) {
		// Create a radial gradient mask that only shows the background (grid of dots) near the cursor position
		dots.style.background = `radial-gradient(circle ${DOTS_SHOW_RADIUS}px at ${x}px ${y}px, transparent 0%, var(--background-primary)),
		url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%23FFFFFF55"><circle cx="50" cy="50" r="${DOTS_SIZE}"></circle></svg>') center center`;
	}

	async function updateCanvas(x: number, y: number, pressure: number) {
		worker.postMessage({
			type: 'updateCanvas',
			data: { x, y, pressure }
		});
	}

	async function saveCanvas(paths: Path[]) {
		if (paths.length >= STORAGE_MAX_PATHS) paths = paths.slice(-STORAGE_MAX_PATHS);
		localStorage.setItem(STORAGE_KEY + $page.url.pathname, JSON.stringify(paths));
	}
</script>

<svelte:window onkeydown={handleKey} onresize={scheduleHandleResize} />
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

		pointer-events: none !important;
		background: none !important;
		border: none !important;
	}
</style>
