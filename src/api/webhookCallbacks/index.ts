import { MoonpayTxEntity, UserEntity } from "../../database/entities";
import qs from "qs";
import { z } from "zod";
import { connectDatabase } from "../../database/database";
import { emitMostRecentMessges } from "../../server";
import { TX_STATUS } from "database/entities/Transactions.entity";

const MoonpaySchema = z
	.object({
		id: z.string(),
		walletAddress: z.string(),
		status: z.string(),
		updatedAt: z.string(),
		baseCurrency: z.string(),
		quoteCurrency: z.string(),
		baseCurrencyAmount: z.number(),
		quoteCurrencyAmount: z.number(),
	})
	.nonstrict();

export interface ApiResponse {
	context: {
		// Context properties...
	};
	event: {
		method: string;
		path: string;
		query: Record<string, any>;
		client_ip: string;
		url: string;
		headers: Record<string, string>;
		body: {
			data: TransactionData;
			type: string;
			externalCustomerId: string;
		};
	};
}

export interface TransactionData {
	id: string;
	walletAddress: string;
	status: string;
	updatedAt: string;
	baseCurrency: string;
	quoteCurrency: string;
	baseCurrencyAmount: number;
	quoteCurrencyAmount: number;
}

export const createTransactionHandler = async (transactionData) => {
	try {
		const queryParsed = qs.parse(transactionData);
		const parsed = MoonpaySchema.safeParse(queryParsed);

		if (parsed.success === false) {
			console.log("Invalid payload");
			throw new Error("Invalid request body");
			//handleErrorBroadCast
			//
		}

		const { walletAddress, status } = parsed.data;
		const connection = await connectDatabase(false);
		const userRepository = connection.getRepository(UserEntity);
		const transactionRepository = connection.getRepository(MoonpayTxEntity);

		let user: UserEntity | undefined = undefined;
		const existingUser = await userRepository.findOneBy({ walletAddress });
		console.log(existingUser);
		if (!existingUser) {
			console.log("No account found with this wallet. Creating new account now");
			user = new UserEntity(walletAddress, []) as UserEntity;
			await userRepository.save(user);
			console.log(user);
			console.log("User successfully created");
		}

		console.log("User exists, now adding transaction to DB");
		const { id, baseCurrencyAmount, quoteCurrency, baseCurrency } = parsed.data;
		const st = status as keyof typeof TX_STATUS;
		const transaction = new MoonpayTxEntity(
			id,
			"MoonPay",
			st,
			Number(baseCurrencyAmount),
			quoteCurrency,
			baseCurrency,
			user ? user : existingUser,
		);
		await transactionRepository.save(transaction);
		//   await userRepository.update()
		console.log("Transaction successfully created");

		console.log("Now fetching user transaction list");
		const userTransactionsEntity = await userRepository
			.createQueryBuilder("user")
			.leftJoinAndSelect("user.transactions", "transactions")
			.where("user.walletAddress = :walletAddress", { walletAddress })
			.getOne();
		console.log(userTransactionsEntity);
		// //   // Emit most recent messages
		// //   // emitMostRecentMessages(transactions);

		console.log("Handler executed successfully");
		return userTransactionsEntity
	} catch (error) {
		console.log("Handler execution failed:", error);
		throw error;
	}
};


export const updateTransactionHandler = async (transactionData) => {
	try {
		const queryParsed = qs.parse(transactionData);
		const parsed = MoonpaySchema.safeParse(queryParsed);

		if (parsed.success === false) {
			console.log("Invalid payload");
			throw new Error("Invalid request body");
			//handleErrorBroadCast
			//
		}

		const { walletAddress, status, id } = parsed.data;
		const st = status as keyof typeof TX_STATUS;

		const connection = await connectDatabase(false);
		const userRepository = connection.getRepository(UserEntity);
		const transactionRepository = connection.getRepository(MoonpayTxEntity);
		const existingTransaction = await transactionRepository.findOneBy({
			transactionId: id,
		});
	
		existingTransaction.status = st
		await transactionRepository.save(existingTransaction)
		console.log("Transaction successfully updated");

		console.log("Now fetching updated user transaction list");
		const userTransactionsEntity = await userRepository
			.createQueryBuilder("user")
			.leftJoinAndSelect("user.transactions", "transactions")
			.where("user.walletAddress = :walletAddress", { walletAddress })
			.getOne();
			
		console.log(userTransactionsEntity);
		// Emit most recent messages
		// emitMostRecentMessages(transactions);

		console.log("Handler executed successfully");
		return userTransactionsEntity
	} catch (error) {
		console.log("Handler execution failed:", error);
		throw error;
	}
};
