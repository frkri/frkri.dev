import { getStroke, type StrokeOptions } from 'perfect-freehand';

export const STORAGE_KEY = 'doodle';
export const STORAGE_MAX_PATHS = 4000;

export const PENCIL_MAX_RADIUS = 30;
export const PENCIL_MIN_RADIUS = 1;
export const PENCIL_DEFAULT_RADIUS = 5;

export const DOTS_SIZE = 3;
export const DOTS_SHOW_RADIUS = 300;

export const CANVAS_MAX_WIDTH = 5500;
export const CANVAS_MAX_HEIGHT = 5500;

export const CANVAS_RESIZE_TIMEOUT = 50;
export const STORAGE_SAVE_TIMEOUT = 1000;

// As per https://github.com/steveruizok/perfect-freehand
const average = (a: number, b: number) => (a + b) / 2;

export function getSvgPathFromStroke(points: number[][], closed = true) {
	const len = points.length;

	if (len < 4) {
		return ``;
	}

	let a = points[0];
	let b = points[1];
	const c = points[2];

	let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(
		2
	)},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(b[1], c[1]).toFixed(2)} T`;

	for (let i = 2, max = len - 1; i < max; i++) {
		a = points[i];
		b = points[i + 1];
		result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(2)} `;
	}

	if (closed) {
		result += 'Z';
	}

	return result;
}

export function getPath2D(points: number[][], strokeStyle: StrokeOptions) {
	const stroke = getStroke(points, strokeStyle);
	const svgPath = getSvgPathFromStroke(stroke);
	return new Path2D(svgPath);
}