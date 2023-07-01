import express, { Express } from "express";
import http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import app from "./app";
import { connectDatabase } from "./database/database";
import { createSocketMessage, getSocketMessages } from "./database/queries";
import { Connection } from "typeorm";
import router from "api/router";
import errorHandler from "middleware/errorHandlingMiddleware";
import cors from "cors";

class Server {
	private app: Express;
	private server: http.Server;
	private io: SocketIOServer;
	public connection: Connection;

	constructor(app: Express, router: express.Router) {
		this.app = app;
		this.server = http.createServer(this.app);
		this.io = new SocketIOServer(this.server, {
			cors: {
				origin: "http://localhost:3000",
				methods: ["GET", "POST"],
			},
		});

		this.configureMiddlewares();
		this.configureRoutes(router);
		this.configureWebSocket();
	}

	private configureMiddlewares(): void {
		this.app.use(express.json());
		this.app.set("trust proxy", true);
		this.app.use(cors({ origin: "*" }));
                this.app.use(errorHandler);
	}

	private configureRoutes(router: express.Router): void {
		this.app.get("/", (req, res) => {
			res.status(200).send({ result: "ok" });
		});
		this.app.use("/", router);

		this.app.get("/ip", (req, res) => {
			const ip =
				req.headers["cf-connecting-ip"] ||
				req.headers["x-real-ip"] ||
				req.headers["x-forwarded-for"] ||
				req.socket.remoteAddress ||
				"";
			res.send(ip);
		});
	}

	public emitMostRecentMessges = async (res?: any) => {
		console.log(res);
		createSocketMessage(res, this.connection)
			.then((tx) => {
				getSocketMessages(this.connection, res.walletAddress, tx)
					.then((result) => this.io.emit("chat message", result))
					.catch(console.log);
			})
			.catch((err) => {
				console.log(err);
				this.io.emit(err);
			});
	};

	private configureWebSocket(): void {
		this.io.on("connection", (socket: Socket) => {
			console.log("New client connected.");

			// Handle WebSocket events and actions
			socket.on("message", (message: any) => {
				console.log("Received message:", message);
				// Process the received message and send response
				// For example: socket.emit('response', { data: 'Hello, Client!' });
			});

			socket.on("disconnect", () => {
				console.log("Client disconnected.");
			});
		});
	}

	public start(port: number): void {
		this.server.listen(port, async () => {
			console.log(`Server listening on port ${port}.`);
			this.connection = await connectDatabase(false);
			this.configureWebSocket();
		});
	}
}

export const websocketserver = new Server(app, router);
websocketserver.start(8005);
