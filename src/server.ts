import "reflect-metadata";
import app from "./app";
import { createSocketMessage, getSocketMessages } from "./database/queries";
import { connectDatabase } from "./database/database";

const socketPort = 8000;
const server = require("http").createServer(app);

const io = require("socket.io")(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
	},
});

// sends out the 10 most recent messages from recent to oldest
export const emitMostRecentMessges = async(res?: any) => {
	console.log(res)
	const conn = await connectDatabase(false)
	createSocketMessage(res, conn)
			.then((tx) => {
				console.log('hey')
				
				getSocketMessages(conn, res.walletAddress, tx)
		.then((result) => io.emit("chat message", result))
		.catch(console.log);
			})
			.catch((err) => {
				console.log(err)
				io.emit(err)
});
};
// connects, creates message, and emits top 10 messages
io.on("connection", (socket) => {
	console.log("a user connected");
	socket.on("chat message", async(msg) => {
		console.log(msg)
		console.log('chat recieved ')
		// const conn = await connectDatabase(false)
		// createSocketMessage(msg, conn)
		// 	.then((_) => {
		// 		emitMostRecentMessges(_);
		// 	})
		// 	.catch((err) => io.emit(err));
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
