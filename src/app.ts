import { CANVAS_DIRECTORY, CANVAS_HEIGHT, CANVAS_WIDTH, QuasiplaceCanvas } from "./canvas";
import { GraphQLSchema, execute, subscribe } from "graphql";
import { ensureDir, readFile } from "fs-extra";

import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { Connection } from "./connection";
import { DrainSubscriptionServerApolloServerPlugin } from "./utils/drain-plugin";
import { LRUCache } from "lru-cache";
import { Server } from "node:http";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { WebSocket } from "ws";
import { connectionLog } from "./utils/log";
import { getResolvers } from "./message/resolvers";
import { makeExecutableSchema } from "@graphql-tools/schema";

const IMAGE_CACHE_MAXIMUM_SIZE = 500;

const REFRESH_INTERVAL = 1000;

export class QuasiplaceApp {
	private readonly connections: Connection[] = [];

	readonly canvases: QuasiplaceCanvas[] = [
		new QuasiplaceCanvas(this, 0, 0, "0"),
		new QuasiplaceCanvas(this, CANVAS_WIDTH, 0, "1"),
		new QuasiplaceCanvas(this, 0, CANVAS_HEIGHT, "2"),
		new QuasiplaceCanvas(this, CANVAS_WIDTH, CANVAS_HEIGHT, "3"),
	];

	readonly imageCache = new LRUCache<string, Buffer>({
		max: IMAGE_CACHE_MAXIMUM_SIZE,
	});

	async start(httpServer: Server): Promise<ApolloServer> {
		await ensureDir(CANVAS_DIRECTORY);

		for (const canvas of this.canvases) {
			await canvas.load();
		}

		const schema = await this.createSchema();

		const subscriptionServer = SubscriptionServer.create({
			execute,
			onConnect: (_: unknown, socket: WebSocket) => this.connect(socket),
			onDisconnect: (socket: WebSocket) => this.disconnect(socket),
			schema,
			subscribe,
		}, {
			path: "/query",
			server: httpServer,
		});

		const graphqlServer = new ApolloServer({
			plugins: [
				ApolloServerPluginDrainHttpServer({
					httpServer,
				}),
				new DrainSubscriptionServerApolloServerPlugin(subscriptionServer),
			],
			schema,
		});

		setInterval(this.refresh.bind(this), REFRESH_INTERVAL);

		await graphqlServer.start();
		return graphqlServer;
	}

	getMutationConnection(): Connection {
		return this.connections[0];
	}

	private async refresh(): Promise<void> {
		for (const connection of this.connections) {
			connection.refresh();
		}

		for (const canvas of this.canvases) {
			await canvas.save();
		}
	}

	private connect(socket: WebSocket): Connection {
		const connection = new Connection(this, socket);
		connectionLog("initialized connection '%s'", connection.getId());

		this.connections.push(connection);
		return connection;
	}

	private disconnect(socket: WebSocket): void {
		let index = 0;

		for (const connection of this.connections) {
			if (connection.isSocket(socket)) {
				connectionLog("disconnected connection '%s'", connection.getId());
				this.connections.splice(index, 1);

				return;
			}

			index += 1;
		}
	}

	private async createSchema(): Promise<GraphQLSchema> {
		const typeDefs = await readFile("./src/utils/schema.graphql");

		return makeExecutableSchema({
			resolvers: getResolvers(this),
			typeDefs: typeDefs.toString(),
		});
	}
}
