<script lang="ts">
	import { CanvasMode, type Path } from '$lib/types/doodle';
	import { page } from '$app/stores';
	import {
		CANVAS_MAX_HEIGHT,
		CANVAS_MAX_WIDTH,
		CANVAS_RESIZE_TIMEOUT,
		DOTS_SHOW_RADIUS,
		DOTS_SIZE,
		KEYBOARD_CURSOR_STEP,
		KEYS_DOWN,
		KEYS_LEFT,
		KEYS_RIGHT,
		KEYS_UP,
		PENCIL_DEFAULT_PRESSURE,
		PENCIL_MAX_RADIUS,
		PENCIL_MIDDLE,
		saveCanvas,
		STORAGE_KEY
	} from './Canvas';

	let {
		worker,
		mode,
		color,
		pencilRadius
	}: { worker: Worker; mode: CanvasMode; color: string; pencilRadius: number } = $props();

	let canvas: HTMLCanvasElement;
	let canvasLeftEdge: number = $state(0);
	let canvasRightEdge: number = $state(0);

	// Controlled by the keyboard only
	let keyboardCursor: HTMLDivElement;
	let keyboardCursorActive: boolean = false;
	let keyboardCursorY: number = 0;
	let keyboardCursorX: number = 0;

	let dots: HTMLDivElement;

	let previousMode = mode;
	let offscreenCanvas: OffscreenCanvas;

	$effect(() => {
		// Only setup the canvas once
		if (offscreenCanvas) return;

		offscreenCanvas = canvas.transferControlToOffscreen();
		setupWorker(offscreenCanvas);
		handleResize();

		keyboardCursor.style.width = `${PENCIL_MAX_RADIUS * 4}px`;
		keyboardCursor.style.height = `${PENCIL_MAX_RADIUS * 4}px`;
	});

	$effect(() => {
		// Rerender the canvas without the removed placeholder doodles
		if (previousMode === CanvasMode.ERASE)
			worker.postMessage({
				type: 'fullyRedrawCanvas',
				data: { canvasLeftEdge }
			});

		// Focus the canvas when changing modes
		if (previousMode === CanvasMode.IDLE) canvas.focus();

		// On any mode change, end the current path
		worker.postMessage({
			type: 'handlePathEnd',
			data: {
				mode
			}
		});

		previousMode = mode;
	});

	$effect(() => {
		// Update the worker with the new state changes
		if (worker)
			worker.postMessage({
				type: 'updateState',
				data: { mode, pencilRadius, color, canvasLeftEdge }
			});

		// Resize the cursor based on the pencil radius
		updateCursor();
	});

	function setupWorker(offscreenCanvas: OffscreenCanvas) {
		worker.onmessage = async (e) => {
			const { type, data } = e.data;
			switch (type) {
				case 'saveCanvas':
					saveCanvas($page.url.pathname, data.paths);
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

	let resizeCanvasTimeout: number | undefined = undefined;
	async function scheduleHandleResize() {
		if (mode === CanvasMode.IDLE) {
			clearInterval(resizeCanvasTimeout);
			resizeCanvasTimeout = setTimeout(handleResize, CANVAS_RESIZE_TIMEOUT) as unknown as number;
		} else {
			handleResize();
		}
	}

	async function handleResize() {
		const dpr = window.devicePixelRatio;
		// Workaround due to finicky overflow scroll behaviour on chromium
		const width = dots.clientWidth - 0.5;
		// Where 80 is the top margin of the body
		const height = document.body.scrollHeight + 80;

		// Update the cursor size
		updateCursor();

		// Dots size
		dots.style.height = height + 'px';

		// Canvas size
		canvas.style.width = width + 'px';
		canvas.style.height = height + 'px';
		worker.postMessage({ type: 'resizeCanvas', data: { width, height, dpr } });

		// Canvas bounds
		const windowMiddle = window.innerWidth / 2;
		canvasLeftEdge = windowMiddle - CANVAS_MAX_WIDTH / 2;
		canvasRightEdge = windowMiddle + CANVAS_MAX_WIDTH / 2;

		// Reset and redraw the canvas
		worker.postMessage({
			type: 'updatePoints',
			data: {
				points: []
			}
		});
		redrawCanvas();
	}

	async function handlePointer(e: PointerEvent) {
		if (mode === CanvasMode.IDLE) return;
		const x = e.pageX;
		const y = e.pageY;

		keyboardCursorX = x;
		keyboardCursorY = y;

		// Hide keyboard cursor when using mouse
		keyboardCursor.style.opacity = '0';

		// Enable the cursor when using the mouse
		if (keyboardCursorActive) {
			keyboardCursorActive = false;
			updateCursor();
		}

		updateCanvas(e.buttons === 1, x, y, e.pressure);
	}

	async function handlePointerUp() {
		if (mode === CanvasMode.IDLE) return;
		worker.postMessage({
			type: 'handlePathEnd',
			data: {
				mode
			}
		});
	}

	let spacebarDown = false;
	async function handleKeyDown(e: KeyboardEvent) {
		if (mode === CanvasMode.IDLE || document.activeElement !== canvas || e.ctrlKey || e.altKey)
			return;

		if (e.key === ' ' || spacebarDown) {
			spacebarDown = true;
			updateCanvas(true, keyboardCursorX, keyboardCursorY, PENCIL_DEFAULT_PRESSURE);
		} else {
			updateCanvas(false, keyboardCursorX, keyboardCursorY, PENCIL_DEFAULT_PRESSURE);
		}

		// Prevent scrolling when using the spacebar
		if (e.key === ' ') e.preventDefault();

		// Move the cursor
		const key = e.key.toLowerCase();
		if (KEYS_UP.includes(key) && keyboardCursorY - KEYBOARD_CURSOR_STEP > 0)
			keyboardCursorY -= KEYBOARD_CURSOR_STEP;
		else if (KEYS_DOWN.includes(key) && keyboardCursorY + KEYBOARD_CURSOR_STEP < CANVAS_MAX_HEIGHT)
			keyboardCursorY += KEYBOARD_CURSOR_STEP;
		else if (KEYS_LEFT.includes(key) && keyboardCursorX - KEYBOARD_CURSOR_STEP > canvasLeftEdge)
			keyboardCursorX -= KEYBOARD_CURSOR_STEP;
		else if (KEYS_RIGHT.includes(key) && keyboardCursorX + KEYBOARD_CURSOR_STEP < canvasRightEdge)
			keyboardCursorX += KEYBOARD_CURSOR_STEP;
		else return;

		if (!keyboardCursorActive) {
			// Hide the mouse cursor when using the keyboard
			canvas.style.cursor = 'none';

			// Show the keyboard cursor
			keyboardCursor.style.opacity = '1';
			keyboardCursorActive = true;
		}

		// Update the cursor position
		keyboardCursor.style.left = `${keyboardCursorX - PENCIL_MIDDLE}px`;
		keyboardCursor.style.top = `${keyboardCursorY - PENCIL_MIDDLE}px`;

		// Prevent the default scroll action of the arrow keys
		e.preventDefault();
		return false;
	}

	async function handleKeyUp(e: KeyboardEvent) {
		if (mode === CanvasMode.IDLE || e.ctrlKey || e.altKey) return;

		if (e.key === ' ') {
			spacebarDown = false;
			worker.postMessage({
				type: 'handlePathEnd',
				data: {
					mode
				}
			});
		}
	}

	async function updateCursor() {
		canvas.style.cursor = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='${PENCIL_MAX_RADIUS * 4}' height='${PENCIL_MAX_RADIUS * 4}' fill='${mode === CanvasMode.DRAW ? color.replace('#', '%23') : '%23FFFFFF'}AA'><circle cx='${PENCIL_MIDDLE}' cy='${PENCIL_MIDDLE}' r='${pencilRadius * window.devicePixelRatio}'></circle></svg>") ${PENCIL_MAX_RADIUS * 2} ${PENCIL_MAX_RADIUS * 2}, auto`;
	}

	async function updateDotsGrid(x: number, y: number) {
		// Create a radial gradient mask that only shows the background (grid of dots) near the cursor position
		dots.style.background = `radial-gradient(circle ${DOTS_SHOW_RADIUS}px at ${x}px ${y}px, transparent 0%, var(--background-primary)),
		url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%23FFFFFF55"><circle cx="50" cy="50" r="${DOTS_SIZE}"></circle></svg>') center center`;
	}

	async function updateCanvas(isPointerDown: boolean, x: number, y: number, pressure: number) {
		// Show the border when the cursor is near the canvas edges
		dots.style.borderLeftWidth = x < canvasLeftEdge ? '40px' : '0px';
		dots.style.borderRightWidth = x > canvasRightEdge ? '40px' : '0px';

		// Allow movement only within the canvas bounds
		if (x < canvasLeftEdge || x > canvasRightEdge || y < 0 || y > CANVAS_MAX_HEIGHT) return;
		updateDotsGrid(x, y);

		// Only draw when the primary button is pressed
		if (isPointerDown)
			worker.postMessage({
				type: 'updateCanvas',
				data: { x, y, pressure }
			});
	}

	async function redrawCanvas(deletedPaths?: Path[]) {
		worker.postMessage({
			type: 'redrawCanvas',
			data: { canvasLeftEdge, deletedPaths }
		});
	}
</script>

<svelte:window onresize={scheduleHandleResize} onkeydown={handleKeyDown} onkeyup={handleKeyUp} />
<div class="canvas-wrapper" class:hidden={mode === CanvasMode.IDLE}>
	<canvas
		tabindex="0"
		bind:this={canvas}
		onpointermove={handlePointer}
		onpointerdown={handlePointer}
		onpointerup={handlePointerUp}
		onpointerleave={handlePointerUp}
	>
	</canvas>
	<div id="dots" bind:this={dots} aria-hidden="true"></div>
	<div id="cursor" bind:this={keyboardCursor} aria-hidden="true">
		<svg xmlns="http://www.w3.org/2000/svg" fill="{mode === CanvasMode.DRAW ? color : '#FFFFFF'}AA">
			<circle cx={PENCIL_MIDDLE} cy={PENCIL_MIDDLE} r={pencilRadius}></circle>
		</svg>
	</div>
</div>

<style>
	.canvas-wrapper * {
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

	#cursor {
		position: absolute;
		opacity: 0;

		z-index: 2;
		pointer-events: none;
	}

	.hidden * {
		z-index: -5;
		opacity: 0.1;

		pointer-events: none !important;
		background: none !important;
		border: none !important;
	}
</style>
