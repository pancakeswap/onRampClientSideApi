// import { getAllUserTransactions } from "./api/user/getTransactions";
// import { emitMostRecentMessges } from "../server";
import { DataSource } from "typeorm";
import { emitMostRecentMessges } from "../server";
import { getDatabase } from "./database";
import { MoonpayTxEntity, UserEntity } from "./entities";
import pool from "./schema";
import axios from "axios";
const connection = getDatabase();
// queries.js
export const getMessages = (request, response) => {
	// pool.query("SELECT * FROM messages ORDER BY id DESC LIMIT 10", (error, results) => {
	// 	if (error) {
	// 		throw error;
	// 	}
	// 	response.status(200).json(results.rows);
	// });
	emitMostRecentMessges();
	response.status(200).send("ok");
};

export const createMessage = (request, response) => {
	const { text, username } = request.body;
	pool.query("INSERT INTO messages (text, username) VALUES ($1, $2) RETURNING text, username, created_at", [text, username], (error, results) => {
		if (error) {
			throw error;
		}
		response.status(201).send(results.rows);
	});
};

export const getSocketMessages = (connection: DataSource) => {
	return new Promise<Array<MoonpayTxEntity>>((resolve, reject) => {
		const userRepository = connection.getRepository(UserEntity);
		userRepository
			.createQueryBuilder("user")
			.leftJoinAndSelect("user.moonpayTransactions", "transaction")
			.getMany()
			.then((users) => {
				const transactions = users.flatMap((user) => user.moonpayTransactions);
				resolve(transactions);
			})
			.catch((error) => {
				reject(error);
			});
	});
};

export const createSocketMessage = async (message, connection: DataSource) => {
	const { walletAddress, ...transactionData } = message;

	const userRepository = connection.getRepository(UserEntity);
	const use = await new UserEntity("0x13E7f71a3E8847399547CE127B8dE420B282E4E4", [], []);
	await userRepository.save(use);
	console.log(use);
	const user = await userRepository.findOneBy({ walletAddress });

	const transactionRepository = connection.getRepository(MoonpayTxEntity);
	const { id, transactionId, status, amount, fiatCurrency, cryptoCurrency } = transactionData;

	const transaction = new MoonpayTxEntity(transactionId, status, amount, fiatCurrency, cryptoCurrency, user);

	transaction.id = id;
	transaction.user = user as any;

	await transactionRepository.save(transaction);
	console.log(transaction);
	return transaction;
};
