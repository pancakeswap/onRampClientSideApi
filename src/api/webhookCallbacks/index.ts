import { assert } from "console";
import { MoonpayTxEntity, UserEntity } from "../../database/entities";
import { Request, Response } from "express";
import qs from "qs";
import { getRepository } from "typeorm";
import { z } from "zod";
import { TransactionStatus } from "./moonpayTxHandler";
import { connectDatabase } from "../../database/database";
import { emitMostRecentMessges } from "../../server";

const MoonpaySchema = z
	.object({
		id: z.number(),
		walletAddress: z.string(),
		status: z.string(),
		updatedAt: z.string(),
		baseCurrency: z.string(),
		quoteCurrency: z.string(),
		baseCurrencyAmount: z.string(),
		quoteCurrencyAmount: z.string(),
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

const processTransactionData = (transactionData: TransactionData) => {
	// Process the transaction data here...
};

const data3 = {
	id: 123,
	walletAddress: '0xc6eD2D6c295579718dbd4a797845CdA70B3C3',
	status: 'completed',
	updatedAt: '2022-08-31T10:00:31.251Z',
	baseCurrency: 'Euro',
	quoteCurrency: 'Ethereum',
	baseCurrencyAmount: '295.45',
	quoteCurrencyAmount: '0.1819',
      };


export const pendingTransactionHandler = async (transactionData): Promise<void> => {
	try {
	  const queryParsed = qs.parse(transactionData);
	  const parsed = MoonpaySchema.safeParse(queryParsed);
      
	  if (parsed.success === false) {
	    console.log("Invalid payload");
	    throw new Error("Invalid request body");
	  }
      
	  const { walletAddress, status } = parsed.data;
	  const connection = await connectDatabase(false);
	  const userRepository = connection.getRepository(UserEntity);
	  const transactionRepository = connection.getRepository(MoonpayTxEntity);
      
	  let user: UserEntity
	  const existingUser = await userRepository.findOneBy({ walletAddress });
	  console.log(existingUser)
	  if (!existingUser) {
	    console.log("No account found with this wallet. Creating new account now");
	    user = new UserEntity(walletAddress, [], [])
	    await userRepository.save(user);
	    console.log(user)
	    console.log("User successfully created");
	  }
      
	  console.log("User exists, now adding transaction to DB");
	  const { transactionId, amount, fiatCurrency, cryptoCurrency } = parsed.data;
	  const transaction = new MoonpayTxEntity(transactionId, status, amount, fiatCurrency, cryptoCurrency, user);
	  await transactionRepository.save(transaction);
	//   await userRepository.update()
	  console.log("Transaction successfully created");
      
	  console.log("Now fetching user transaction list");
	  const userTransactionsEntity = await userRepository
	    .createQueryBuilder("user")
	    .leftJoinAndSelect("user.moonpayTransactions", "moonpayTransactions")
	    .getMany();
      
	//     userTransactionsEntity.forEach((tx) => console.log(tx))
	//   const transactions = userTransactionsEntity.flatMap((user) => user.walletAddress);
	//   console.log("Transactions received", transactions);

	//   console.log(transactions[2], 'hhh')
      
	// //   // Emit most recent messages
	// //   // emitMostRecentMessages(transactions);
      
	//   console.log("Handler executed successfully");
	} catch (error) {
	  console.log("Handler execution failed:", error);
	  throw error;
	}
      };
      
