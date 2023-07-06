import { NextFunction, Request, Response } from "express";
import { fetchMercuryoQuote, fetchMoonpayQuote } from "./fetchers/ProviderQuoteFetchers";
import { APIError } from "../../utils/APIError";

import {
	fetchBinanceConnectAvailability,
	fetchMercuryoAvailability,
	fetchMoonpayAvailability,
} from "./fetchers/ipAvailabilityFetchers";
import { ProviderIPAvailability, toDtoIP } from "../../typeValidation/model/ProviderIp";
import { validateIpSchema } from "../../typeValidation/proxyValidation/providerIpAvailability";
import { ProviderQuote, toPtoQU } from "../../typeValidation/model/ProviderQuote";
import { validateProviderQuoteSchema } from "../../typeValidation/proxyValidation/providerQuotes";
// to-do

function convertQuoteToBase(usdAmount: number, etherPrice: number): number {
	const ethAmount = usdAmount / etherPrice;
	return ethAmount;
}

type MoonpayData = {
	alpha2: string;
	alpha3: string;
	country: string;
	ipAddress: string;
	isAllowed: boolean;
	isBuyAllowed: boolean;
	isNftAllowed: boolean;
	isSellAllowed: boolean;
	isLowLimitEnabled: boolean;
	state: string;
    };

// to-do
export const fetchProviderQuotes = async (req: Request, res: Response, next: NextFunction) => {
	const request: ProviderQuote = toPtoQU(req.body);
	const validationResult = validateProviderQuoteSchema(request);

	if (!validationResult.success) {
		throw new Error(validationResult.data as string);
	}
	const { fiatCurrency, cryptoCurrency, amount, network } = request;

	const responsePromises = [
		fetchMoonpayQuote(amount, fiatCurrency, cryptoCurrency),
		fetchMercuryoQuote(fiatCurrency, cryptoCurrency, amount),
	];
	const responses = await Promise.allSettled(responsePromises);

	console.log('responses', responses)
	const dataPromises = responses
		.reduce((accumulator, response) => {
			if (response.status === "fulfilled") {
				return [...accumulator, response.value];
			}
			console.error("Error fetching price quotes:", response.reason);
			return accumulator;
		}, [])
		.filter((item) => typeof item !== "undefined");

	const providerqUOTES = dataPromises.map((item) => {
		if (item.code === "MoonPay" && !item.error) {
			const { baseCurrencyAmount, networkFeeAmount, quoteCurrencyPrice } = item.result;
			const totalFeeAmount = baseCurrencyAmount * 0.0315 + networkFeeAmount;
			const currencyAmtMinusFees = baseCurrencyAmount - totalFeeAmount;
			const receivedEthAmount = convertQuoteToBase(currencyAmtMinusFees, quoteCurrencyPrice);

			return {
				providerFee: baseCurrencyAmount * 0.0315,
				networkFee: networkFeeAmount,
				amount: baseCurrencyAmount,
				quote: receivedEthAmount,
				fiatCurrency: fiatCurrency.toUpperCase(),
				cryptoCurrency: cryptoCurrency.toUpperCase(),
				provider: item.code,
			};
		}
		if (item.code === "Mercuryo" && !item.error) {
			const data = item.result.data;
			const totalFeeAmount = Number(data.fee[fiatCurrency.toUpperCase()]);
			const currencyAmtMinusFees = Number(data.fiat_amount) - totalFeeAmount;
			const receivedEthAmount = convertQuoteToBase(currencyAmtMinusFees, Number(data.rate));

			return {
				providerFee: Number(data.fee[fiatCurrency.toUpperCase()]),
				networkFee: 0,
				amount: Number(data.fiat_amount),
				quote: receivedEthAmount,
				fiatCurrency: fiatCurrency.toUpperCase(),
				cryptoCurrency: cryptoCurrency.toUpperCase(),
				provider: item.code,
			};
		}
		return {
			providerFee: 0,
			networkFee: 0,
			amount: 0,
			quote: 0,
			fiatCurrency: fiatCurrency.toUpperCase(),
			cryptoCurrency: cryptoCurrency.toUpperCase(),
			provider: item.code,
		};
	});

	return res.status(200).json({ result: providerqUOTES });
};

//     export const fetchProviderAvailability = async (req: Request, res: Response, next: NextFunction) => {
// 	const { userIp } = req.body;
// 	const responsePromises = [fetchMoonpayAvailability(userIp), fetchMercuryoAvailability(userIp)];
// 	const responses = await Promise.allSettled(responsePromises);

// 	const dataPromises = responses
// 	  .reduce((accumulator, response) => {
// 	    if (response.status === 'fulfilled') {
// 		return [...accumulator, response.value];
// 	    }
// 	    console.error('Error fetching price quotes:', response.reason);
// 	    return accumulator;
// 	  }, [])
// 	  .filter((item) => typeof item !== 'undefined');

// 	let availabilityMapping: { [provider: string]: boolean } = {};
// 	dataPromises.forEach((item) => {
// 	  if (item.code === 'MoonPay' && !item.error) availabilityMapping[item.code] = item.result.isAllowed;
// 	  else if (item.code === 'Mercuryo' && !item.error) availabilityMapping[item.code] = item.result.country.enabled;
// 	  else availabilityMapping[item.code] = false;
// 	});
// 	return res.status(200).json({ result: availabilityMapping });
//     };

export const fetchmercuryoQuote = async (req: Request, res: Response, next: NextFunction) => {
	const request: ProviderQuote = toPtoQU(req.body);
	const validationResult = validateProviderQuoteSchema(request);

	if (!validationResult.success) {
		throw new Error(validationResult.data as string);
	}
	const { fiatCurrency, cryptoCurrency, amount, network } = request;
	try {
		const result = await await fetchMercuryoQuote(fiatCurrency, cryptoCurrency, amount);

		return res.status(200).json({ result });
	} catch (error: any) {
		return next(error);
	}
};

export const fetchMoonPayQuote = async (req: Request, res: Response, next: NextFunction) => {
	const request: ProviderQuote = toPtoQU(req.body);
	const validationResult = validateProviderQuoteSchema(request);

	if (!validationResult.success) {
		throw new Error(validationResult.data as string);
	}
	const { fiatCurrency, cryptoCurrency, amount, network } = request;
	try {
		const result = await await fetchMoonpayQuote(amount, fiatCurrency, cryptoCurrency);

		return res.status(200).json({ result });
	} catch (error: any) {
		return next(error);
	}
};

export const fetchMoonPayIpAvailability = async (req: Request, res: Response, next: NextFunction) => {
	const request: ProviderIPAvailability = toDtoIP(req.query);
	const validationResult = validateIpSchema(request);

	if (!validationResult.success) {
		throw new Error(validationResult.data as string);
	}
	const { userIp } = request;
	try {
		const result = await fetchMoonpayAvailability<MoonpayData>(userIp);
		return res.status(200).json({ result });
	} catch (error: any) {
		return next(error);
	}
};

export const fetchMercuryoIpAvailability = async (req: Request, res: Response, next: NextFunction) => {
	const request: ProviderIPAvailability = toDtoIP(req.query);
	const validationResult = validateIpSchema(request);

	if (!validationResult.success) {
		throw new Error(validationResult.data as string);
	}
	const { userIp } = request;
	try {
		const result = await fetchMercuryoAvailability(userIp);
		return res.status(200).json({ result });
	} catch (error: any) {
		return next(error);
	}
};

export const fetchBinanceConnectIpAvailability = async (req: Request, res: Response, next: NextFunction) => {
	const { userIp } = req.body;
	try {
		const result = await fetchBinanceConnectAvailability(userIp);
		return res.status(200).json({ result });
	} catch (error: any) {
		return next(new APIError(error.message, error?.reason, error?.status));
	}
};
