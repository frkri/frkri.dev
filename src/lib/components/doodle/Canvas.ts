import LZString from 'lz-string';
import { getStroke, type StrokeOptions } from 'perfect-freehand';
import { type Path } from '$lib/types/doodle';

export const STORAGE_KEY = 'doodle';
export const STORAGE_VERSION = 0;
export const STORAGE_VERSION_DELIMITER = ';';
export const STORAGE_MAX_PATHS = 4000;

export const PENCIL_MAX_RADIUS = 30;
export const PENCIL_MIN_RADIUS = 1;
export const PENCIL_MIDDLE = (PENCIL_MAX_RADIUS * 4) / 2;
export const PENCIL_DEFAULT_RADIUS = 5;
export const PENCIL_DEFAULT_PRESSURE = 0.5;

export const DOTS_SIZE = 3;
export const DOTS_SHOW_RADIUS = 300;

export const CANVAS_MAX_WIDTH = 5500;
export const CANVAS_MAX_HEIGHT = 5500;

export const CANVAS_RESIZE_TIMEOUT = 50;
export const STORAGE_SAVE_TIMEOUT = 1000;

export const KEYBOARD_CURSOR_STEP = 10;
export const KEYS_UP = ['arrowup', 'w', 'k'];
export const KEYS_DOWN = ['arrowdown', 's', 'j'];
export const KEYS_LEFT = ['arrowleft', 'a', 'h'];
export const KEYS_RIGHT = ['arrowright', 'd', 'l'];

export function loadCanvas(suffix: string): Path[] {
	const paths = localStorage.getItem(STORAGE_KEY + suffix);
	if (paths == null) return [];
	const delimiterPosition = paths.indexOf(STORAGE_VERSION_DELIMITER);

	// Skip migrations if saved format doesn't contain version field
	if (delimiterPosition === -1) return JSON.parse(paths);

	const versionField = Number.parseInt(paths.slice(0, delimiterPosition));
	console.debug('Canvas is using v' + versionField);
	// Todo run migrations

	return JSON.parse(LZString.decompressFromUTF16(paths.substring(delimiterPosition + 1)));
}

export async function saveCanvas(suffix: string, paths: Path[]) {
	paths = paths.filter((path) => path.points.length > 0);
	if (paths.length >= STORAGE_MAX_PATHS) paths = paths.slice(-STORAGE_MAX_PATHS);

	const data =
		STORAGE_VERSION.toString() +
		STORAGE_VERSION_DELIMITER +
		LZString.compressToUTF16(JSON.stringify(paths));
	localStorage.setItem(STORAGE_KEY + suffix, data);
}

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
