import { Request, Response } from "express";
import { createTransactionHandler, updateTransactionHandler } from ".";

interface ApiResponse {
	context: {
		id: string;
		ts: string;
		pipeline_id: string | null;
		workflow_id: string;
		deployment_id: string;
		source_type: string;
		verified: boolean;
		hops: any[] | null;
		test: boolean;
		replay: boolean;
		owner_id: string;
		platform_version: string;
		workflow_name: string;
		resume: null;
		trace_id: string;
	};
	event: {
		method: string;
		path: string;
		query: Record<string, any>;
		client_ip: string;
		url: string;
		headers: Record<string, string>;
		body: {
			data: {
				isFromQuote: boolean;
				isRecurring: boolean;
				isTicketPayment: boolean;
				id: string;
				createdAt: string;
				updatedAt: string;
				baseCurrencyAmount: number;
				quoteCurrencyAmount: number;
				feeAmount: number;
				extraFeeAmount: number;
				networkFeeAmount: number;
				areFeesIncluded: boolean;
				flow: string;
				status: string;
				walletAddress: string;
				walletAddressTag: null;
				cryptoTransactionId: string;
				failureReason: null;
				redirectUrl: string;
				returnUrl: string;
				widgetRedirectUrl: null;
				bankTransferReference: null;
				baseCurrencyId: string;
				currencyId: string;
				customerId: string;
				cardId: string;
				bankAccountId: null;
				eurRate: number;
				usdRate: number;
				gbpRate: number;
				bankDepositInformation: null;
				externalTransactionId: null;
				feeAmountDiscount: null;
				paymentMethod: string;
				baseCurrency: {
					id: string;
					createdAt: string;
					updatedAt: string;
					type: string;
					name: string;
					code: string;
					precision: number;
					maxAmount: number;
					minAmount: number;
					minBuyAmount: number;
					maxBuyAmount: number | null;
				};
				currency: {
					id: string;
					createdAt: string;
					updatedAt: string;
					type: string;
					name: string;
					code: string;
					precision: number;
					maxAmount: number;
					minAmount: number;
					minBuyAmount: number;
					maxBuyAmount: null;
					addressRegex: string;
					testnetAddressRegex: string;
					supportsAddressTag: boolean;
					addressTagRegex: null;
					supportsTestMode: boolean;
					supportsLiveMode: boolean;
					isSuspended: boolean;
					isSupportedInUS: boolean;
					notAllowedUSStates: string[];
					notAllowedCountries: string[];
					isSellSupported: boolean;
					confirmationsRequired: number;
					minSellAmount: number;
					maxSellAmount: number;
					metadata: {
						contractAddress: string;
						chainId: string;
						networkCode: string;
					};
				};
				nftTransaction: null;
				country: string;
				state: string;
				externalCustomerId: string;
				nftToken: null;
			};
			type: string;
			externalCustomerId: string;
		};
	};
}

interface TransactionData {
	id: string;
	walletAddress: string;
	status: string;
	updatedAt: string;
	baseCurrency: string;
	quoteCurrency: string;
	baseCurrencyAmount: number;
	quoteCurrencyAmount: number;
}

type Assets = {
	baseCurrency: string;
	quoteCurrency: string;
};

// Extract the TransactionData object from ApiResponse
type ExtractTransactionData<T> = T extends ApiResponse ? T["event"]["body"]["data"] : never;

// Extract the desired properties from TransactionData
type ExtractedTransactionData = Pick<
	ExtractTransactionData<ApiResponse>,
	"id" | "walletAddress" | "status" | "updatedAt" | "baseCurrencyAmount" | "quoteCurrencyAmount"
>;

type WorkableTxdata = ExtractedTransactionData & Assets;
// Usage example
const transactionData: WorkableTxdata = {
	id: "123",
	walletAddress: "0xABC",
	status: "completed",
	updatedAt: "2023-06-24",
	baseCurrency: "USD",
	quoteCurrency: "BTC",
	baseCurrencyAmount: 1000,
	quoteCurrencyAmount: 0.1,
};

export const TransactionUpdaterWebHook = async (req: Request, res: Response): Promise<void> => {
	const transactionData = req.body;

	if (transactionData.status === "PENDING") {
		const returnedData = await createTransactionHandler(transactionData);
		res.status(200).json({ data: returnedData });

	} else if (["COMPLETED", "FAILED"].includes(transactionData.status)) {
		const returnedData = await updateTransactionHandler(transactionData);
		res.status(200).json({ data: returnedData });
	}
};
