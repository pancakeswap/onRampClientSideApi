import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { UserEntity, MoonpayTxEntity, MercuryoTxEntity } from '../../database/entities';
import { z } from 'zod';

import ErrorResponse from '../../utils/errorResponse';

const providerSchema = z.array(z.string());

export const getUserTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { provider, txId } = req.query;
    const parsedProviders = providerSchema.safeParse([provider]);

    if (!parsedProviders.success) {
      return next(new ErrorResponse('Invalid provider', 400));
    }

    const providers = parsedProviders.data;

    if (txId) {
      // Retrieve a specific transaction by transaction ID
      const moonpayTransactionRepository = getRepository(MoonpayTxEntity);
      const transaction = await moonpayTransactionRepository.findOneBy({ transactionId: txId as string });

      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      return res.status(200).json({ transaction });
    }

    const userRepository = getRepository(UserEntity);
    const users = await userRepository.find({ relations: ['moonpayTransactions'] });

    let transactions: MoonpayTxEntity[] = [];

    for (const user of users) {
      if (providers.includes('moonpay')) {
        transactions.push(...user.moonpayTransactions);
      }
      // Add more conditions for other providers if needed

      // If both providers are passed, fetch transactions for both
      if (providers.length > 1) {
        if (providers.includes('mercuryo')) {
          // Fetch transactions for 'mercuryo' provider
          // Assuming a similar relationship and repository for 'mercuryo' transactions
          const mercuryoTransactionRepository = getRepository(MercuryoTxEntity);
          const mercuryoTransactions = await mercuryoTransactionRepository.find({
            where: { user: user },
          });
          transactions.push(...mercuryoTransactions);
        }
        // Add more conditions for other providers if needed
      }
    }

    res.status(200).json({ transactions });
  } catch (error) {
    console.error('Error retrieving transactions:', error);
    res.status(400).json({ message: 'Invalid request' });
  }
};


export const getAllUserTransactions = async (req: Request, res: Response) => {
    try {
      const userRepository = getRepository(UserEntity);
      const users = await userRepository.find({ relations: ['moonpayTransactions'] });
      
  
      let transactions: MoonpayTxEntity[] = [];
  
      for (const user of users) {
        transactions.push(...user.moonpayTransactions);
      }
  
      res.status(200).json({ transactions });
    } catch (error) {
      console.error('Error retrieving transactions:', error);
      res.status(400).json({ message: 'Invalid request' });
    }
  };
