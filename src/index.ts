import { QuasiplaceApp } from "./app";
import { createServer } from "node:http";
import express from "express";
import { expressMiddleware } from "@apollo/server/express4";
import { json } from "body-parser";
import { log } from "./utils/log";

const PORT = 8193;
export const HOST = "http://localhost:" + PORT;

const app = express();
const httpServer = createServer(app);

async function start() {
	log("starting the server");

	const quasiplace = new QuasiplaceApp();
	const graphqlServer = await quasiplace.start(httpServer);

	app.use("/query", json(), expressMiddleware(graphqlServer));

	app.use(express.static("public", {
		extensions: [
			"html",
		],
	}));

	app.post("/svc/mona-lisa/perf-metrics", (_, res) => {
		res.sendStatus(200);
	});

	app.post("/svc/mona-lisa/v2j", (_, res) => {
		res.sendStatus(200);
	});

	app.get("/svc/mona-lisa/get-user-data", (_, res) => {
		res.json({
			canParticipate: true,
			id: "",
			isEmployee: false,
			readonlyMode: false,
		});
	});

	app.get("/canvas/:id", (req, res) => {
		const { id } = req.params;
		const image = quasiplace.imageCache.get(id);

		if (image) {
			res
				.status(200)
				.contentType("image/png")
				.send(image);
		} else {
			res.sendStatus(404);
		}
	});

	httpServer.listen(PORT, () => {
		log("server started on port %d (%s)", PORT, HOST);
	});
}
/* eslint-disable-next-line unicorn/prefer-top-level-await */
start();
