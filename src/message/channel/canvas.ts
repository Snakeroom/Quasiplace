import { Channel } from "./channel";
import { QuasiplaceCanvas } from "../../canvas";

export class CanvasChannel extends Channel {
	private readonly canvas: QuasiplaceCanvas;

	constructor(canvas: QuasiplaceCanvas) {
		super(canvas.getFullFrameMessage());
		this.canvas = canvas;
	}

	refresh(): void {
		this.send(this.canvas.getFullFrameMessage());
	}
}
