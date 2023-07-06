import { string as zString, object as zObject } from "zod";
import { ProviderQuote } from "../../typeValidation/model/ProviderQuote";

export const quoteSchema = zObject({
	fiatCurrency: zString(),
	cryptoCurrency: zString(),
	amount: zString(),
	network: zString(),

});

export const validateProviderQuoteSchema = (
	request: ProviderQuote,
): {
	success: boolean;
	data: ProviderQuote | string;
} => {
	const result = quoteSchema.safeParse(request);
	const { success } = result;

	if (success) {
		const data = result.data as ProviderQuote;
		return { success, data };
	} else
		return {
			success,
			data: JSON.stringify(`Provider Quote schema Validation Error ${JSON.stringify(result)}`).replace(/\\/g, ""),
		};
};