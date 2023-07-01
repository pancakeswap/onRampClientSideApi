import "reflect-metadata";
import { createConnection, Connection, getRepository, DataSource } from "typeorm";
import { UserEntity, MoonpayTxEntity } from "./database/entities";
import { getDatabase } from "./database/database";
import { createTransactionHandler, updateTransactionHandler } from "./api/webhookCallbacks";
import axios from "axios";
// import { createUsers } from './crud/'
// const connection = getDatabase()
const app = async () => {
	const connection: Connection = await createConnection({
		type: "postgres",
		host: "localhost",
		port: 5432,
		username: "pcs",
		password: "Emcg45245!",
		database: "api",
		// synchronize: true,
		// logging: true,
		entities: [UserEntity, MoonpayTxEntity],
		// logger: new CustomeLogger(),
		// host: 'localhost',
		// port: 3306,
		// username: 'test',
		// password: 'test',
		// database: 'test',
	});
	// Creates database schema for all entities registered in this connection.
	// Can be used only after connection to the database is established.
	// pass true to drop everything b4 creating anything
	// await connection.dropDatabase()
	await connection.synchronize(false).catch(console.error);
	return connection;
	// await createUsers(connection)
};

// app().then((connection) => getSocketMessages3(connection))

const getSocketMessages3 = (connection: DataSource) => {
	return new Promise((resolve, reject) => {
		const userRepository = connection.getRepository(UserEntity);
		userRepository
			.createQueryBuilder("user")
			.leftJoinAndSelect("user.moonpayTransactions", "transaction")
			.getMany()
			.then((users) => {
				const transactions = users.flatMap((user) => user.transactions);
				resolve(transactions);
			})
			.catch((error) => {
				reject(error);
			});
	});
};

// const getSocketMessages3 = (connection: DataSource) => {
// // console.log(connection)
// //  let conn = getConne
//   const userRepository = connection.getRepository(UserEntity);
// // console.log(connection)
//   return userRepository
//     .createQueryBuilder('user')
//     .leftJoinAndSelect('user.moonpayTransactions', 'transaction')
//     .getMany()
//     .then(users => users.flatMap(user => user.moonpayTransactions))
//     .catch(error => {
//       throw error;
//     });
// };

// node src

export const createSocketMessage = async (message, connection) => {
	return new Promise((resolve, reject) => {
		const { walletAddress, ...transactionData } = message;

		const userRepository = connection.getRepository(UserEntity);
		const userPromise = userRepository.findOneBy({ walletAddress });

		const transactionRepository = connection.getRepository(MoonpayTxEntity);
		const { transactionId, status, amount, fiatCurrency, cryptoCurrency } = transactionData;

		// userPromise
		// 	.then((user) => {
		// 		const transaction = new MoonpayTxEntity(transactionId, status, amount, fiatCurrency, cryptoCurrency, user);
		// 		return transactionRepository.save(transaction);
		// 	})
		// 	.then((transaction) => {
		// 		resolve(transaction);
		// 	})
		// 	.catch((error) => {
		// 		reject(error);
		// 	});
	});
};

const data = {
	id: 123,
	walletAddress: "0x13E7f71a3E8847399547CE127B8dE420B282E4E4",
	transactionId: "abc123",
	status: "complete",
	amount: 1000,
	fiatCurrency: "USD",
	cryptoCurrency: "BTC",
};

// const data3 = {
// 	id: '22',
// 	walletAddress: '0xc6eD2D6c295579718dbd4a7845CdA70B3C3611',
// 	status: 'pending',
// 	updatedAt: '2022-08-31T10:00:31.251Z',
// 	baseCurrency: 'Euro',
// 	quoteCurrency: 'Ethereum',
// 	baseCurrencyAmount: '295',
// 	quoteCurrencyAmount: '0.1819',
//       };

      function generateRandomData(overrideId?: string, overrideWalletAddress?: string, overrideStatus?: string): any {
	const id = overrideId || Math.floor(Math.random() * 1000).toString();
	const walletAddress = overrideWalletAddress || '0x' + Math.random().toString(16).substr(2, 40);
	const statusOptions = ['PENDING', 'COMPLETED', 'FAILED'];
	const status = overrideStatus || statusOptions[Math.floor(Math.random() * statusOptions.length)];
	const updatedAt = new Date().toISOString();
	const baseCurrency = 'Euro';
	const quoteCurrency = 'Ethereum';
	const baseCurrencyAmount = Math.floor(Math.random() * 1000);
	const quoteCurrencyAmount = Number((Math.random() * 1).toFixed(4));
      
	return {
	  id,
	  walletAddress,
	  status,
	  updatedAt,
	  baseCurrency,
	  quoteCurrency,
	  baseCurrencyAmount,
	  quoteCurrencyAmount,
	};
      }
      
      // Example usage:
//       const data3 = generateRandomData('0xc6eD2D6c295579718dbd4a7845CdA70B3C3611', 'completed');
//       console.log(data3);
      
// getSocketMessages3().then(console.log)
// app().then(async(connection) => {
// 	const randomData = generateRandomData('123', '0xc6eD2D6c295579718dbd4a7845CdA70B3C3615', 'PENDING');
// 	console.log(randomData)
// 	// await createTransactionHandler(randomData)

// 	// //wait 5 seconds
// 	// randomData.status = 'COMPLETED'
// 	// await updateTransactionHandler(randomData)
// });

const testMockWebHook = async () => {
	const payload =  {
	
		walletAddress: "0x13E7f713E888473gg99547CE127B8d77E2827",
		transactionId: "99479a",
		status: "completed",
		amount: 1000,
		fiatCurrency: "USD",
		cryptoCurrency: "BTC",
	};
	//const res = await axios.get("http://localhost:8005/get-messages", { params: { walletAddress: '0x13E7f713E888473gg99547CE127B8d77E2827'}});

	try {
		const res = await axios.post("http://localhost:8000/messages", payload);
		const result = res;
		console.log(result.data);
	} catch (error) {
		console.error("Error fetching data:", error.data);
	}
};

testMockWebHook()
