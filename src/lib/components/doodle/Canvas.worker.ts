import { CanvasMode, type Path } from '$lib/types/doodle';
import type { StrokeOptions } from 'perfect-freehand';
import { getPath } from './Canvas';

const STORAGE_SAVE_TIMEOUT = 1000;

let canvas: OffscreenCanvas;
let ctx: OffscreenCanvasRenderingContext2D;

let mode: CanvasMode;
let color: string;

let pencilRadius: number;
let strokeStyle: StrokeOptions;
let canvasLeftEdge: number;

/**
 * Current temporary points that are being drawn on the canvas
 */
let points: number[][] = [];
/**
 * The paths that are complete and drawn on the canvas
 */
let paths: Path[] = [];

addEventListener('message', async (e) => {
	const { type, data } = e.data;
	switch (type) {
		case 'init': {
			canvas = data.canvas;
			const context = canvas.getContext('2d');
			if (!context) {
				console.warn('Failed to get canvas context ):');
				return;
			}
			ctx = context;
			break;
		}

		case 'updateState': {
			const {
				mode: localMode,
				color: localColor,
				pencilRadius: localPencilRadius,
				strokeStyle: localStrokeStyle,
				canvasLeftEdge: localCanvasLeftEdge
			} = data;
			if (localMode) mode = localMode;
			if (localColor) color = localColor;
			if (localPencilRadius) pencilRadius = localPencilRadius;
			if (localStrokeStyle) strokeStyle = localStrokeStyle;
			if (localCanvasLeftEdge) canvasLeftEdge = localCanvasLeftEdge;
			break;
		}

		case 'updatePoints': {
			const { points: localPoints } = data;
			points = localPoints;
			break;
		}

		case 'updatePaths': {
			const { paths: localPaths } = data;
			paths = localPaths;
			break;
		}

		case 'resizeCanvas': {
			const { width, height, dpr } = data;
			canvas.width = width * dpr;
			canvas.height = height * dpr;
			ctx.scale(dpr, dpr);
			break;
		}

		case 'redrawCanvas': {
			const { strokeStyle, canvasLeftEdge, deletedPaths } = data;
			redrawCanvas(strokeStyle, canvasLeftEdge, deletedPaths);
			break;
		}

		case 'updateCanvas': {
			const { x, y, pressure } = data;
			updateCanvas(x, y, pressure);
			break;
		}

		case 'handlePointerUp': {
			handlePointerUp();
			break;
		}

		default:
			console.warn(`Unhandled message type on worker side: ${type}`);
	}
});

async function redrawCanvas(
	strokeStyle: StrokeOptions,
	canvasLeftEdge: number,
	deletedPaths?: Path[]
) {
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
		redrawCanvas(strokeStyle, canvasLeftEdge, overlappingPaths);
	}
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

async function saveCanvas() {
	postMessage({ type: 'saveCanvas', data: { paths } });
}
