import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../canvas";

import { Message } from "./message";
import { PALETTE } from "../utils/color";
import { QuasiplaceApp } from "../app";

export class ConfigurationMessage extends Message {
	private readonly app: QuasiplaceApp;

	constructor(app: QuasiplaceApp) {
		super();
		this.app = app;
	}

	getCanvasConfigurations() {
		return this.app.canvases.map((canvas, index) => ({
			dx: canvas.x,
			dy: canvas.y,
			index,
		}));
	}

	getCanvasHeight(): number {
		return CANVAS_HEIGHT;
	}

	getCanvasWidth(): number {
		return CANVAS_WIDTH;
	}

	getColorPalette() {
		return {
			colors: PALETTE.map((color, index) => ({
				hex: color,
				index,
			})),
		};
	}

	getDataTypeName(): string {
		return "ConfigurationMessageData";
	}
}
