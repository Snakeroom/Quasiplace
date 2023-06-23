import { ApolloServerPlugin, GraphQLServerListener } from "@apollo/server";
import { SubscriptionServer } from "subscriptions-transport-ws";

export class DrainSubscriptionServerApolloServerPlugin implements ApolloServerPlugin, GraphQLServerListener {
	private readonly subscriptionServer: SubscriptionServer;

	constructor(subscriptionServer: SubscriptionServer) {
		this.subscriptionServer = subscriptionServer;
	}

	/* eslint-disable-next-line require-await */
	async serverWillStart(): Promise<GraphQLServerListener> {
		return {
			drainServer: this.drainServer.bind(this),
		};
	}

	async drainServer(): Promise<void> {
		await this.subscriptionServer.close();
	}
}
