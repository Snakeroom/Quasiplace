import { Canvas, CanvasRenderingContext2D, createCanvas, loadImage } from "canvas";

import { FullFrameMessage } from "./message/full-frame";
import { Message } from "./message/message";
import { PALETTE } from "./utils/color";
import { QuasiplaceApp } from "./app";
import { canvasLog } from "./utils/log";
import { createWriteStream } from "node:fs";
import { nanoid } from "nanoid";
import { pipeline } from "node:stream/promises";

export const CANVAS_DIRECTORY = "./canvas/";
const CANVAS_EXTENSION = ".png";

export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 1000;

const BORDER_COLOR = "#78AB32";
const FILL_COLOR = "#121212";

const BORDER_THICKNESS = 2;

export class QuasiplaceCanvas {
	private readonly app: QuasiplaceApp;

	readonly x: number;
	readonly y: number;

	private readonly id: string;
	private readonly path: string;

	private dirty = false;

	private readonly canvas: Canvas;
	private readonly context: CanvasRenderingContext2D;

	constructor(app: QuasiplaceApp, x: number, y: number, id: string) {
		this.app = app;

		this.x = x;
		this.y = y;

		this.id = id;
		this.path = CANVAS_DIRECTORY + id + CANVAS_EXTENSION;

		this.canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
		this.context = this.canvas.getContext("2d");
	}

	async load(): Promise<void> {
		try {
			const image = await loadImage(this.path);
			this.context.drawImage(image, 0, 0);
		} catch (error) {
			if (error.code === "ENOENT") {
				canvasLog("initializing the '%s' canvas", this.id);

				this.context.fillStyle = BORDER_COLOR;
				this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

				this.context.fillStyle = FILL_COLOR;
				this.context.fillRect(BORDER_THICKNESS, BORDER_THICKNESS, this.canvas.width - BORDER_THICKNESS * 2, this.canvas.height - BORDER_THICKNESS * 2);
			} else {
				canvasLog("failed to load the '%s' canvas: %O", this.id, error);
			}
		}
	}

	async save(): Promise<void> {
		if (!this.dirty) return;

		canvasLog("saving the '%s' canvas", this.id);
		await pipeline(this.canvas.createPNGStream(), createWriteStream(this.path));
		canvasLog("saved the '%s' canvas", this.id);

		this.dirty = false;
	}

	setPixel(x: number, y: number, colorIndex: number): boolean {
		if (x < 0 || y < 0 || x >= this.canvas.width || y >= this.canvas.height) {
			return false;
		}

		const color = PALETTE[colorIndex];
		if (!color) {
			return false;
		}

		this.context.fillStyle = color;
		this.context.fillRect(x, y, 1, 1);

		this.dirty = true;
		return true;
	}

	getFullFrameMessage(): Message {
		const id = nanoid();
		this.app.imageCache.set(id, this.canvas.toBuffer());

		return new FullFrameMessage(id);
	}
}
