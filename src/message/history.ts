import { Message } from "./message";

export class HistoryMessage extends Message {
	getLastModifiedTimestamp() {
		return -1;
	}

	getUserInfo() {
		return {
			userID: -1,
			username: "Pixel Placer",
		};
	}

	getDataTypeName(): string {
		return "GetTileHistoryResponseMessageData";
	}
}
