import { Connection } from "../connection";
import { Message } from "./message";

export class CooldownMessage extends Message {
	private readonly connection: Connection;

	constructor(connection: Connection) {
		super();
		this.connection = connection;
	}

	getCooldownEndTimestamp(): number {
		return this.connection.getCooldownEndTimestamp();
	}

	getDataTypeName(): string {
		return "GetUserCooldownResponseMessageData";
	}
}
