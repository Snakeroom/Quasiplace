import { ConfigurationMessage } from "./configuration";
import { Connection } from "../connection";
import { CooldownMessage } from "./cooldown";
import { HistoryMessage } from "./history";
import { IResolvers } from "@graphql-tools/utils";
import { Message } from "./message";
import { PlaceResponseMessage } from "./place-response";
import { QuasiplaceApp } from "../app";

export function getResolvers(app: QuasiplaceApp): IResolvers<unknown, Connection> {
	return {
		ActResponse: {
			data: (messages: Message[]) => messages,
		},
		BasicMessage: {
			data: (message: Message) => message,
		},
		ConfigurationMessageData: {
			canvasConfigurations: (message: ConfigurationMessage) => message.getCanvasConfigurations(),
			canvasHeight: (message: ConfigurationMessage) => message.getCanvasHeight(),
			canvasWidth: (message: ConfigurationMessage) => message.getCanvasWidth(),
			colorPalette: (message: ConfigurationMessage) => message.getColorPalette(),
		},
		GetTileHistoryResponseMessageData: {
			lastModifiedTimestamp: (message: HistoryMessage) => message.getLastModifiedTimestamp(),
			userInfo: (message: HistoryMessage) => message.getUserInfo(),
		},
		GetUserCooldownResponseMessageData: {
			nextAvailablePixelTimestamp: (message: CooldownMessage) => message.getCooldownEndTimestamp(),
		},
		Message: {
			__resolveType: () => "BasicMessage",
		},
		MessageData: {
			__resolveType: (message: Message) => message.getDataTypeName(),
		},
		Mutation: {
			act: (_, args) => app.getMutationConnection()?.act(args),
		},
		SetPixelResponseMessageData: {
			timestamp: (message: PlaceResponseMessage) => message.getTimestamp(),
		},
		Subscription: {
			subscribe: {
				subscribe: (_, args, connection) => connection.subscribe(args),
			},
		},
	};
}
