import { NextFunction, Request, Response } from 'express';
import { fetchMercuryoQuote } from './fetchers/ProviderQuoteFetchers';
import { APIError } from '../../utils/APIError';
import { providerQuotesSchema } from '../../typeValidation/validation';
import { fetchBinanceConnectAvailability, fetchMercuryoAvailability, fetchMoonpayAvailability } from './fetchers/ipAvailabilityFetchers';

// to-do
export const fetchProviderQuotes = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body;
  const { fiatCurrency, cryptoCurrency, fiatAmount } = req.body
  try {
    const validPayload = providerQuotesSchema.safeParse(payload);
    if (!validPayload.success) {
      throw new Error('payload has the incorrect shape. please check you types');
    }
    const result = await await fetchMercuryoQuote(fiatCurrency, cryptoCurrency, fiatAmount)
   

    return res.status(200).json({ result });
  } catch (error: any) {
    return next(new APIError(error.message, error?.reason, error?.status));
  }
};

export const fetchMoonPayIpAvailability = async(req: Request, res: Response, next: NextFunction) => {
  const userIp = req.query.userIp.toString();
  try {
    const result = await fetchMoonpayAvailability(userIp)
    return res.status(200).json({ result });
  } catch (error: any) {
    return next(new APIError(error.message, error?.reason, error?.status));
  }
}

export const fetchMercuryoIpAvailability = async(req: Request, res: Response, next: NextFunction) => {
  const userIp = req.query.userIp.toString();
  try {
    const result = await fetchMercuryoAvailability(userIp)
    return res.status(200).json({ result });
  } catch (error: any) {
    return next(new APIError(error.message, error?.reason, error?.status));
  }
}

export const fetchBinanceConnectIpAvailability = async(req: Request, res: Response, next: NextFunction) => {
  const {userIp} = req.body
  try {
    const result = await fetchBinanceConnectAvailability(userIp)
    return res.status(200).json({ result });
  } catch (error: any) {
    return next(new APIError(error.message, error?.reason, error?.status));
  }
}