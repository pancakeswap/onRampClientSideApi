import { NextFunction, Request, Response } from "express";

import qs from "qs";
import crypto from "crypto";
import { post } from "../../services/axios";
import { populatBuildTradeParams, populate_GET_RequestSigContent, sign } from "../../utils/rsa_sig";
import { BINANCE_CONNECT_URL, MOONPAY_URL } from "../../config/constants";
import config from "../../config/config";
import {
	MercuryoSigRequest,
	MercuryoSigRequestPOST,
	toDto,
	toPto,
} from "../../typeValidation/model/MercuryoSigRequest";
import { MoonPaySigRequest, toPtoMp } from "../../typeValidation/model/MoonPaySigRequest";
import { validateMercuryoSchema, validateMercuryoSchemaPOST, validateMoonPaySchema } from "../../typeValidation/signatureValidation/signatureValidation";
import { bscPriceQuoteSchema, validateBinanceConnectSchema } from "../../typeValidation/validation";

export const generateMercuryoSig = async (req: Request, res: Response, next: NextFunction) => {
	const secret = await crypto.webcrypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(config.mercuryoSecretKey),
		{ name: "HMAC", hash: "SHA-512" },
		false,
		["sign", "verify"],
	);

	try {
		if (req.method === "GET") {
			const request: MercuryoSigRequest = toDto(req.query);
			const validationResult = validateMercuryoSchema(request);

			if (!validationResult.success) {
				throw new Error(validationResult.data as string);
			}
			const { walletAddress } = request;

			const hash = crypto
				.createHash("sha512")
				.update(`${walletAddress}${config.mercuryoSecretKey}`)
				.digest("hex");
			return res.json({ signature: hash });
		} else if (req.method === "POST") {
			const request: MercuryoSigRequestPOST = toPto(req.body);
			const validationResult = validateMercuryoSchemaPOST(request);

			if (!validationResult.success) {
				throw new Error(validationResult.data as string);
			}
			const { message } = request;
			const signature = req.headers["x-api-signature"] as string | undefined;
			if (!signature) {
				return res.status(400).json({
					success: false,
					reason: "the signature need to be included in the headers as x-api-signature",
				});
			}
			const sigBuf = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0));
			const isVerified = await crypto.webcrypto.subtle.verify(
				"HMAC",
				secret,
				sigBuf,
				new TextEncoder().encode(message),
			);

			return res.json({ verified: isVerified });
		} else {
			return res.status(400).json({ success: false, message: "unsupported method" });
		}
	} catch (error) {
		next(error);
	}
};

export const generateMoonPaySig = async (req: Request, res: Response, next: NextFunction) => {
	const request: MoonPaySigRequest = toPtoMp(req.body);
	const validationResult = validateMoonPaySchema(request);

	if (!validationResult.success) {
		console.log('heyshdgd')

		throw new Error(validationResult.data as string);
	}
	try {
		const supportedTokens = request.showOnlyCurrencies as unknown as string;
		const encodedCurrencyList = encodeURIComponent(supportedTokens);
		const moonPayTradeUrl = `&theme=${request.theme}&colorCode=%2382DBE3&defaultCurrencyCode=${request.defaultCurrencyCode}&baseCurrencyCode=${request.baseCurrencyCode}&baseCurrencyAmount=${request.baseCurrencyAmount}&walletAddress=${request.walletAddress}&showOnlyCurrencies=${encodedCurrencyList}`;
		const originalUrl = `${MOONPAY_URL}${moonPayTradeUrl}`;

		const signature = crypto
			.createHmac("sha256", config.moonpaySecretKey)
			.update(new URL(originalUrl).search)
			.digest("base64");

		const returnData = `${originalUrl}&signature=${encodeURIComponent(signature)}`;

		res.json({ urlWithSignature: returnData });
	} catch (error) {
		next(error);
	}
};

export const generateBinanceConnectSig = async (req: Request, res: Response, next: NextFunction) => {
	const queryString =
		req.method === "GET" ? qs.stringify({ message: req.query.message }) : qs.stringify(req.body);

	const queryParsed = qs.parse(queryString);

	if (req.method === "GET") {
		// to do
		const parsed = validateBinanceConnectSchema(
			"BinanceConnectGET",
			queryParsed,
			res,
		) ;
		const privateKey = await crypto.webcrypto.subtle.importKey(
			"raw",
			new TextEncoder().encode(config.privateKey),
			{ name: "HMAC", hash: "SHA-256" },
			false,
			["sign", "verify"],
		);
		const { message } = parsed.data;
		const signature = req.headers["x-api-signature"] as string | undefined;
		if (!signature) {
			return res.status(400).json({
				success: false,
				reason: "the signature need to be included in the headers as x-api-signature",
			});
		}
		const sigBuf = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0));
		const isVerified = await crypto.webcrypto.subtle.verify(
			"HMAC",
			privateKey,
			sigBuf,
			new TextEncoder().encode(message),
		);

		return res.json({ verified: isVerified });
	} else if (req.method === "POST") {
		const parsed = validateBinanceConnectSchema(
			"BinanceConnectPOST",
			queryParsed,
			res,
		);

		const { walletAddress } = parsed.data;

		const merchantCode = "pancake_swap_test";
		const timestamp = Date.now().toString();

		const contentToSign = populate_GET_RequestSigContent(walletAddress, merchantCode, timestamp);
		const signature = sign(contentToSign, process.env.PRIVATE_KEY.replace(/\\n/g, "\n"));

		const buildTradeUrl = populatBuildTradeParams({
			...parsed.data,
			merchantCode,
			timestamp,
			signature,
		});
		const returnData = `${BINANCE_CONNECT_URL}${buildTradeUrl}}`;

		res.json({ urlWithSignature: returnData, message: buildTradeUrl, contentToSign });
	} else {
		return res.status(400).json({ success: false, message: "unsupported method" });
	}
};

export const fetchBscQuote = async (req: Request, res: Response, next: NextFunction) => {
	try {
		console.log("my name is evan");
		const payload = req.body;
		const validPayload = bscPriceQuoteSchema.safeParse(payload);
		if (!validPayload.success) {
			throw new Error("payload has the incorrect shape. please check you types");
		}
		const merchantCode = "pancake_swap_test";
		const timestamp = Date.now().toString();

		const payloadString = JSON.stringify(payload);
		const contentToSign = `${payloadString}&merchantCode=${merchantCode}&timestamp=${timestamp}`;

		const signature = sign(contentToSign, config.privateKey.replace(/\\n/g, "\n"));
		const endpoint = `https://sandbox.bifinitypay.com/bapi/fiat/v1/public/open-api/connect/get-quote`;

		console.log(contentToSign, endpoint);
		// NEED TO LOK UP API DOCS FOR RET TYPE WILL DO LATER
		post<any, any>(endpoint, payload, {
			headers: {
				"Content-Type": "application/json",
				merchantCode,
				timestamp,
				"x-api-signature": signature,
			},
		})
			.then((response) => {
				res.status(200).json(response);
			})
			.catch((error) => {
				if (error.response) {
					res.status(error.response.status).json(error.response.data);
				} else {
					res.status(500).json({
						error: "Internal Server Error",
						message: error.message,
					});
				}
			});
	} catch (error: any) {
		return next(error);
	}
};

