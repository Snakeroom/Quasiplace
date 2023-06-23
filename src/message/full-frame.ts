import { HOST } from "..";
import { Message } from "./message";

export class FullFrameMessage extends Message {
	private readonly name: string;
	private readonly timestamp = Date.now();

	constructor(id: string) {
		super();
		this.name = `${HOST}/canvas/${id}`;
	}

	getDataTypeName(): string {
		return "FullFrameMessageData";
	}
}
