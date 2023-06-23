import { Message } from "./message";

export class PlaceResponseMessage extends Message {
	private readonly timestamp: number;

	constructor() {
		super();
		this.timestamp = Date.now();
	}

	getTimestamp() {
		return this.timestamp;
	}

	getDataTypeName(): string {
		return "SetPixelResponseMessageData";
	}
}
