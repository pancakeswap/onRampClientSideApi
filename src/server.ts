import "reflect-metadata";
import express, { Express } from "express";
import http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { connectDatabase } from "./database/database";
import { Connection } from "typeorm";
import router from "./api/router";
import errorHandler from "./middleware/errorHandlingMiddleware";
import cors from "cors";
import { WebhookResponse } from "./api/webhookCallbacks/webhookHandlers";
import { MoonpayTxEntity, UserEntity } from "./database/entities";
import { TX_STATUS } from "./database/entities/Transactions.entity";
import { Logger, createLogger } from "winston";
import MiddleWares from "./middleware/Kernel";

const socketPort = 8000;

class Server {
	private app: Express;
	private server: http.Server;
	private io: SocketIOServer;
	public connection: Connection;
	public logger: Logger

	constructor(router: express.Router) {
		this.app = express();
		this.server = http.createServer(this.app);
		this.io = new SocketIOServer(this.server, {
			cors: {
				origin: "http://127.0.0.1:3000",
				methods: ["GET", "POST"],
			},
		});

		this.configureMiddlewares();
		this.configureRoutes(router);
		this.configureWebSocket();
		this.logger = createLogger()

	}

	private configureMiddlewares(): void {
		this.app.use(express.json());
		this.app.set("trust proxy", true);
		this.app.use(cors({ origin: "*" }));
                this.app.use(errorHandler);
		// MiddleWares.init(this.app)
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

	public emitMostRecentMessges = async (res?: WebhookResponse) => {
		this.createSocketMessage(res)
			.then((tx) => {
				this.getSocketMessages(res.walletAddress, tx)
					.then((result) => this.io.emit("chat message", result))
					.catch(console.log);
			})
			.catch((err) => {
				console.log(err);
				this.io.emit(err);
			});
	};

	public getSocketMessages = (walletAddress: string, tx: MoonpayTxEntity) => {
		return new Promise<{ userTxs: UserEntity; updatedTx: MoonpayTxEntity }>((resolve, reject) => {
			const userRepository = this.connection.getRepository(UserEntity);
			userRepository
				.createQueryBuilder("user")
				.leftJoinAndSelect("user.transactions", "transactions")
				.where("user.walletAddress = :walletAddress", { walletAddress })
				.getOne()
				.then((res) => {
					console.log(res)
					resolve({ userTxs: res, updatedTx: tx });
				})
				.catch((error) => {
					reject(error);
				});
		});
	};

	public createSocketMessage = async (message: WebhookResponse) => {
		const { walletAddress, transactionId, status, updatedAt } = message;
	
		const userRepository = this.connection.getRepository(UserEntity);
		const transactionRepository = this.connection.getRepository(MoonpayTxEntity);
		let user = await userRepository.findOneBy({ walletAddress });
		let transaction = await transactionRepository.findOneBy({
			transactionId,
		});
	
		if (!user) {
			user = await new UserEntity(walletAddress, []);
			await userRepository.save(user);
		}
		if (!transaction) {
			const { providerFee, networkFee, rate, fiatCurrency, cryptoCurrency, network, type } =
				message;
			transaction = new MoonpayTxEntity(
				transactionId,
				type,
				status as keyof typeof TX_STATUS,
				message.fiatAmount,
				message.cryptoAmount,
				providerFee,
				networkFee,
				rate,
				fiatCurrency,
				cryptoCurrency,
				network,
				updatedAt,
				user,
			);
			await transactionRepository.save(transaction);
		}
		transaction.status = status as keyof typeof TX_STATUS;
		transaction.updatedAt = updatedAt;
		await transactionRepository.save(transaction);
		console.log(user)
		return transaction;
	};

	private configureWebSocket(): void {
		this.io.on("connection", (socket: Socket) => {
			console.log("New client connected.");

			socket.on("message", (message: any) => {
				console.log("Received message:", message);
			});

			socket.on("disconnect", () => {
				console.log("Client disconnected.");
			});
		});
	}

	public start(port: number): void {
		this.server.listen(port, async () => {
			console.log(`Server listening on port ${port}.`);
			this.connection = await connectDatabase(this.logger, false);
			this.configureWebSocket();
		});
	}
}

export const websocketserver = new Server(router);
websocketserver.start(socketPort);
