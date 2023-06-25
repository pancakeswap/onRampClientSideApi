import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { UserEntity, MoonpayTxEntity } from '../../database/entities';
import { z } from 'zod';
import qs from 'qs';
import ErrorResponse from '../../utils/errorResponse';

enum TransactionStatus {
  Pending = 'pending',
  Complete = 'complete',
  Failed = 'failed',
}

const transactionSchema = z.object({
  id: z.number(),
  transactionId: z.string(),
  status: z.nativeEnum(TransactionStatus),
  amount: z.number(),
  fiatCurrency: z.string(),
  cryptoCurrency: z.string(),
  walletAddress: z.string(),
});

const createTransaction = async (transactionData: any, user: UserEntity) => {
  const { id, transactionId, status, amount, fiatCurrency, cryptoCurrency } = transactionData;

  const transaction = new MoonpayTxEntity(transactionId, status, amount, fiatCurrency, cryptoCurrency);
  transaction.id = id;
  transaction.user = user;

  return transaction;
};

export const mercuryoTransactionHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryString = qs.stringify(req.body);
    const queryParsed = qs.parse(queryString);
    const parsed = transactionSchema.safeParse(queryParsed);

    if (parsed.success === false) {
      return next(new ErrorResponse('Invalid request body', 400));
    }

    const { walletAddress, ...transactionData } = parsed.data;

    const userRepository = getRepository(UserEntity);
    const transactionRepository = getRepository(MoonpayTxEntity);
    const user = await userRepository.findOneBy({ walletAddress });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { status } = transactionData;

    if (status === TransactionStatus.Pending) {
      const transaction = await createTransaction(transactionData, user);

      await transactionRepository.save(transaction);

      res.status(201).json({ message: 'Transaction created successfully' });
    } else if (status === TransactionStatus.Complete || status === TransactionStatus.Failed) {
      const { transactionId } = transactionData;
      const transaction = await transactionRepository.findOne({ transactionId });

      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      transaction.status = status;
      await transactionRepository.save(transaction);

      res.status(200).json({ message: 'Transaction updated successfully' });
    } else {
      return res.status(400).json({ message: 'Invalid transaction status' });
    }
  } catch (error) {
    console.error('Error creating/updating transaction:', error);
    res.status(400).json({ message: 'Invalid request body' });
  }
};
