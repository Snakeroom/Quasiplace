import { nanoid } from "nanoid";

export abstract class Message {
	private readonly id: string = nanoid();

	abstract getDataTypeName(): string;
}
