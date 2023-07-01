// import { getAllUserTransactions } from "./api/user/getTransactions";
// import { emitMostRecentMessges } from "../server";
import { DataSource } from "typeorm";
import { emitMostRecentMessges } from "../server";
import { connectDatabase } from "./database";
import { MoonpayTxEntity, UserEntity } from "./entities";
import { TX_STATUS } from "./entities/Transactions.entity";

// queries.js
export const getMessages = (request, response) => {
	const data = request.body
	emitMostRecentMessges(data);
	response.status(200).json({data});
};

export const getUserMessages = async(request, response) => {
	const { walletAddress } = request.query
	const connection = await connectDatabase(false)
	const userRepository = connection.getRepository(UserEntity);
	const transactions = await userRepository
		.createQueryBuilder("user")
		.leftJoinAndSelect("user.transactions", "transactions")
		.where("user.walletAddress = :walletAddress", { walletAddress })
		.getOne()
	response.status(200).json({ transactions: transactions.transactions })
}

export const getSocketMessages = (connection: DataSource, walletAddress: string, tx: MoonpayTxEntity) => {
	return new Promise<{ userTxs: UserEntity, updatedTx: MoonpayTxEntity}>((resolve, reject) => {
		const userRepository = connection.getRepository(UserEntity);
		userRepository
			.createQueryBuilder("user")
			.leftJoinAndSelect("user.transactions", "transactions")
			.where("user.walletAddress = :walletAddress", { walletAddress })
			.getOne().then((res) => {
				console.log(res)
				resolve({ userTxs: res, updatedTx: tx})
	})
			.catch((error) => {
				reject(error);
			});
	});
};

export const createSocketMessage = async (message, connection: DataSource) => {
	const { walletAddress, transactionId, status, ...transactionData } = message;

	const userRepository = connection.getRepository(UserEntity);
	const transactionRepository = connection.getRepository(MoonpayTxEntity);
	let user = await userRepository.findOneBy({ walletAddress });
	let transaction = await transactionRepository.findOneBy({
		transactionId
	});

	if (!user) {
		user = await new UserEntity(walletAddress, []);
		await userRepository.save(user);
	}
	if (!transaction) {
		const { amount, fiatCurrency, cryptoCurrency } = transactionData;
		const st = status as keyof typeof TX_STATUS;
		transaction = new MoonpayTxEntity(transactionId, 'MoonPay', st, amount, fiatCurrency, cryptoCurrency, user);
		await transactionRepository.save(transaction);
	}
	const st = status as keyof typeof TX_STATUS;
	transaction.status = st
	await transactionRepository.save(transaction)
	console.log(user, 'if undefined is user');
	return transaction;
};
