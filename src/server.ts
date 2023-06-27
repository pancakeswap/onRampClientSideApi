import "reflect-metadata";
import { Server } from "http";
import app from "./app";
import logger from "./utils/logger";
import { createSocketMessage, getSocketMessages } from "./database/queries";
import { connectDatabase, getDatabase } from "./database/database";
import { getUnpackedSettings } from "http2";
import { getAllUserTransactions, getUserTransactions } from "./api/user/getTransactions";
import { AppDataSource } from "../ormconfig";

const connection = getDatabase()
const port = Number(process.env.PORT);
const socketPort = 8000;

const { emit } = require("process");
const server = require("http").createServer(app);

const io = require("socket.io")(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
	},
});
const data = {
	
	walletAddress: "0x13E7f71a3E8847399547CE127B8dE420B282E4E4",
	transactionId: "abc123",
	status: "complete",
	amount: 1000,
	fiatCurrency: "USD",
	cryptoCurrency: "BTC",
};
// sends out the 10 most recent messages from recent to oldest
export const emitMostRecentMessges = async(res?: any) => {
	console.log(res)
	const conn = await connectDatabase(false)
	createSocketMessage(data, conn)
			.then((_) => {
				console.log('hey')
				getSocketMessages(conn)
		.then((result) => io.emit("chat message", result))
		.catch(console.log);
			})
			.catch((err) => io.emit(err));
};
// connects, creates message, and emits top 10 messages
io.on("connection", (socket) => {
	console.log("a user connected");
	socket.on("chat message", async(msg) => {
		console.log(msg)
		const conn = await connectDatabase(false)
		createSocketMessage(msg, conn)
			.then((_) => {
				emitMostRecentMessges(_);
			})
			.catch((err) => io.emit(err));
	});
	// close event when user disconnects from app
	socket.on("disconnect", () => {
		console.log("user disconnected");
	});
});
server.listen(socketPort, () => {
	console.log(`listening on *:${socketPort}`);
});

(async () => {
	await connectDatabase(false);
})();
