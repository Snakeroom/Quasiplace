import { Message } from "../message";
import { PubSub } from "graphql-subscriptions";

export class Channel {
	private readonly initialMessages: Message[];
	private readonly pubSub = new PubSub();

	constructor(...initialMessages: Message[]) {
		this.initialMessages = initialMessages;
	}

	send(message: Message) {
		this.pubSub.publish("", {
			subscribe: message,
		});
	}

	async *[Symbol.asyncIterator]() {
		for (const initialMessage of this.initialMessages) {
			yield {
				subscribe: initialMessage,
			};
		}

		const iterable = {
			[Symbol.asyncIterator]: () => this.pubSub.asyncIterator([
				"",
			]),
		};

		for await (const value of iterable) {
			yield value;
		}
	}
}
