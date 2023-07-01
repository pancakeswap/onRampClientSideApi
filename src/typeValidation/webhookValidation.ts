import { z } from 'zod'

export const baseCurrencySchema = z.object({
	id: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
	type: z.string(),
	name: z.string(),
	code: z.string(),
	precision: z.number(),
	maxAmount: z.number(),
	minAmount: z.number(),
	minBuyAmount: z.number(),
	maxBuyAmount: z.number(),
	isSellSupported: z.boolean(),
});

export const currencySchema = z.object({
	id: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
	type: z.string(),
	name: z.string(),
	code: z.string(),
	precision: z.number(),
	maxAmount: z.number().nullable(),
	minAmount: z.number(),
	minBuyAmount: z.number(),
	maxBuyAmount: z.number().nullable(),
	isSellSupported: z.boolean(),
	addressRegex: z.string(),
	testnetAddressRegex: z.string(),
	supportsAddressTag: z.boolean(),
	addressTagRegex: z.string().nullable(),
	supportsTestMode: z.boolean(),
	supportsLiveMode: z.boolean(),
	isSuspended: z.boolean(),
	isSupportedInUS: z.boolean(),
	notAllowedUSStates: z.array(z.string()),
	notAllowedCountries: z.array(z.string()),
	confirmationsRequired: z.number(),
	minSellAmount: z.number(),
	maxSellAmount: z.number(),
	metadata: z.object({
		contractAddress: z.string(),
		coinType: z.string(),
		chainId: z.string(),
		networkCode: z.string(),
	}),
});

export const getValidQuoteSchema = z.object({
	externalId: z.string().nullable(),
	id: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
	transactionId: z.string(),
	baseCurrencyId: z.string(),
	baseCurrencyAmount: z.number(),
	quoteCurrencyId: z.string(),
	quoteCurrencyAmount: z.number(),
	quoteCurrencyPrice: z.number(),
	feeAmount: z.number(),
	extraFeeAmount: z.number(),
	networkFeeAmount: z.number(),
	networkFeeAmountNonRefundable: z.boolean(),
	areFeesIncluded: z.boolean(),
	isValid: z.boolean(),
	signature: z.string(),
	provider: z.string(),
	quoteCurrencySpreadPercentage: z.number(),
});

export const dataSchema = z.object({
	baseCurrencyAmount: z.number(),
	feeAmount: z.number(),
	networkFeeAmount: z.number(),
	status: z.string(),
	walletAddress: z.string(),
});

export const userSchema = z.object({
	uuid4: z.string(),
	country_code: z.string(),
	phone: z.string(),
});

export const MercuryoDataSchema = z.object({
	amount: z.string(),
	fiat_amount: z.string(),
	id: z.string(),
	created_at: z.string(),
	created_at_ts: z.number(),
	updated_at: z.string(),
	updated_at_ts: z.number(),
	type: z.string(),
	merchant_transaction_id: z.string(),
	currency: z.string(),
	fiat_currency: z.string(),
	payment_method: z.string(),
	status: z.string(),
	user: userSchema,
	card_masked_pan: z.null(),
});

export const myDataSchema = z.object({
	data: MercuryoDataSchema,
	eventId: z.string(),
});
type MyData = z.infer<typeof myDataSchema>;
