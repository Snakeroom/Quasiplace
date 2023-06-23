import { CanvasChannel } from "./message/channel/canvas";
import { Channel } from "./message/channel/channel";
import { ConfigurationMessage } from "./message/configuration";
import { CooldownMessage } from "./message/cooldown";
import { HistoryMessage } from "./message/history";
import { Message } from "./message/message";
import { PlaceResponseMessage } from "./message/place-response";
import { QuasiplaceApp } from "./app";
import { WebSocket } from "ws";
import { connectionLog } from "./utils/log";
import { nanoid } from "nanoid";

const COOLDOWN = 1000 * 3;

type MessageArgsInput = {
	actionName: "r/replace:get_user_cooldown";
} | {
	actionName: "r/replace:get_tile_history";
} | {
	actionName: "r/replace:set_pixel";
	PixelMessageData: {
		canvasIndex: number;
		colorIndex: number;
		coordinate: {
			x: number;
			y: number;
		}
	};
};

interface SubscriptionArgsInput {
	channel: {
		category: string;
		tag: string;
	}
}

interface MessageArgs<T> {
	input: T;
}

export class Connection {
	private readonly app: QuasiplaceApp;
	private readonly socket: WebSocket;

	private readonly id = nanoid();

	private readonly configChannel: Channel;
	private readonly canvasChannels: CanvasChannel[];

	private cooldownEndTimestamp = -1;

	constructor(app: QuasiplaceApp, socket: WebSocket) {
		this.app = app;
		this.socket = socket;

		this.configChannel = new Channel(new ConfigurationMessage(this.app));
		this.canvasChannels = this.app.canvases.map(canvas => {
			return new CanvasChannel(canvas);
		});
	}

	refresh(): void {
		for (const canvasChannel of this.canvasChannels) {
			canvasChannel.refresh();
		}
	}

	act(args: MessageArgs<MessageArgsInput>): Message[] | null {
		const action = args.input.actionName;

		if (action === "r/replace:get_user_cooldown") {
			return [
				new CooldownMessage(this),
			];
		} else if (action === "r/replace:get_tile_history") {
			return [
				new HistoryMessage(),
			];
		} else if (action === "r/replace:set_pixel") {
			const data = args.input.PixelMessageData;

			this.app.canvases[data.canvasIndex].setPixel(data.coordinate.x, data.coordinate.y, data.colorIndex);
			this.cooldownEndTimestamp = Date.now() + COOLDOWN;

			return [
				new PlaceResponseMessage(),
				new CooldownMessage(this),
			];
		}

		connectionLog("received unknown action '%s' from connection '%s'", action, this.id);
		return null;
	}

	subscribe(args: MessageArgs<SubscriptionArgsInput>): Channel | null {
		const category = args.input.channel.category;

		if (category === "CONFIG") {
			return this.configChannel;
		} else if (category === "CANVAS") {
			const tag = args.input.channel.tag;
			return this.canvasChannels[parseInt(tag)];
		}

		connectionLog("received unknown channel category '%s' from connection '%s'", category, this.id);
		return null;
	}

	getId(): string {
		return this.id;
	}

	isSocket(socket: WebSocket): boolean {
		return socket === this.socket;
	}

	getCooldownEndTimestamp(): number {
		return this.cooldownEndTimestamp;
	}
}
