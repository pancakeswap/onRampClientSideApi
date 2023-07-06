import { NextFunction, Request, Response } from "express";
import { string as zString, object as zObject } from "zod";

export const BinanceConnectPOST = zObject({
	walletAddress: zString(),
	cryptoCurrency: zString(),
	fiatCurrency: zString(),
	amount: zString(),
});

export const bscPriceQuoteSchema = zObject({
	fiatCurrency: zString(),
	cryptoCurrency: zString(),
	fiatAmount: zString(),
	cryptoNetwork: zString(),
	paymentMethod: zString(),
});

export const BinanceConnectGET = zObject({
	message: zString(),
});

export const bscQuotepayloadSchema = zObject({
	BinanceConnectPOST,
	BinanceConnectGET,
});

export const validateBinanceConnectSchema = (indexer: string, queryParsed: qs.ParsedQs, res: Response) => {
	const parsed = bscQuotepayloadSchema.shape[indexer].safeParse(queryParsed);
	if (parsed.success === false)
		return res.status(400).json({ success: false, message: JSON.stringify(queryParsed) });
	else return parsed;
};

export const checkIpPayloadSchema = zObject({
	clientUserIp: zString(),
});

export function requireQueryParams(params: Array<string>) {
	return (req: Request, res: Response, next: NextFunction) => {
		const fails: string[] = [];
		for (const param of params) {
			if (!req.query[param]) {
				fails.push(param);
			}
		}
		if (fails.length > 0) {
			res.status(400).send(`${fails.join(",")} required`);
		} else {
			next();
		}
	};
}
