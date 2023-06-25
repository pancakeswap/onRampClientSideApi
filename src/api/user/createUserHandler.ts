import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { UserEntity } from '../../database/entities';
import { z } from 'zod';
import qs from 'qs';

import ErrorResponse from '../../utils/errorResponse';

const userSchema = z.object({
  walletAddress: z.string(),
});

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryString = qs.stringify(req.body);
    const queryParsed = qs.parse(queryString);
    const parsed = userSchema.safeParse(queryParsed);
    console.log(queryParsed, queryParsed, req.body)

    if (parsed.success === false) {
      console.log('failing')
      return next(new ErrorResponse('invalid qequest body', 0));
    }
    const { walletAddress} = parsed.data;

    const userRepository = getRepository(UserEntity);
    const existingUser = await userRepository.findOneBy({ walletAddress });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this wallet address already exists' });
    }

    const user = new UserEntity(walletAddress, [], []);
    user.walletAddress = walletAddress;

    // Save the user entity to the database
    const savedUser = await userRepository.save(user);
    res.status(201).json({ message: 'User created successfully', savedUser });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ message: 'Invalid request body' });
  }
};

