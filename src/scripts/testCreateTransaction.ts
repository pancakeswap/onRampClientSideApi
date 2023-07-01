import { connectDatabase } from "../database/database"
import { MoonpayTxEntity, UserEntity } from "../database/entities";
import { getRepository } from "typeorm";

const main = async() => {
        //drop prev db
        const connection = await connectDatabase(false)
        const userRepository = connection.getRepository(UserEntity);

        const user = new UserEntity('12346', [])
        await userRepository.save(user)
}

const dropDB = async() => {
        //drop prev db
        const connection = await connectDatabase(true)
        const userRepository = connection.getRepository(UserEntity);
        const transactionRerpository = connection.getRepository(MoonpayTxEntity);


        const users = userRepository.find()
        const transactions = transactionRerpository.find()
        
        console.log(users)
        console.log(transactions)
}

const checkDB = async() => {
        //drop prev db
        const connection = await connectDatabase(true)
        const userRepository = connection.getRepository(UserEntity);
        const transactionRerpository = connection.getRepository(MoonpayTxEntity);


        const users = userRepository.find()
        const transactions = transactionRerpository.find()
        
        console.log(users)
        console.log(transactions)
}

const createTransaction = async() => {
        const connection = await connectDatabase(false)
        const userRepository = connection.getRepository(UserEntity);
        const transactionRerpository = connection.getRepository(MoonpayTxEntity);

        const existingUser = await userRepository.findOneBy({
                walletAddress: '12345',
        });

        console.log(existingUser)

        const transaction = new MoonpayTxEntity('0a2', 'MoonPay', 'PENDING', 0, 'USD', 'BNB', existingUser)
        await transactionRerpository.save(transaction)
        console.log(transaction)

}

const findAllUsers = async() => {
        const connection = await connectDatabase(false)
        const userRepository = connection.getRepository(UserEntity);
        const transactionRerpository = connection.getRepository(MoonpayTxEntity);



        // const allUsers = await userRepository
        // .createQueryBuilder("user")
        // .leftJoinAndSelect("user.transactions", "transactions")
        // .getMany()
        const user = await userRepository.findOneBy({ walletAddress: '0xc6eD2D6c295579718dbd4a7845CdA70B3C3615'})
        const userTransactions = await userRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.transactions', 'transaction')
  .where('user.walletAddress = :walletAddress', { walletAddress: '0xc6eD2D6c295579718dbd4a7845CdA70B3C3615' })
  .getOne();
        //     .then((users) => {
        //         const transactions = users.flatMap((user) => user.moonpayTransactions);
        //         resolve(transactions);
        // })
        
        // const allTransactions = await transactionRerpository.find({
        // relations: {
        //         user: true,
        // },
        // })
        console.log(user)
        console.log(userTransactions)

        // console.log(allUsers[0].transactions)

}

const updateTransactin = async() => {
        const connection = await connectDatabase(false)
       
        const transactionRerpository = connection.getRepository(MoonpayTxEntity);

        const existingTransaction = await transactionRerpository.findOneBy({
                transactionId: '0a2',
        });

        existingTransaction.status = 'COMPLETED'
        await transactionRerpository.save(existingTransaction)


}

findAllUsers()