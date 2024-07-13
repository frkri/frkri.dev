export enum CanvasMode {
	IDLE,
	DRAW,
	ERASE
}

export interface Path {
	color: string;
	width: number;
	points: number[][];
}
