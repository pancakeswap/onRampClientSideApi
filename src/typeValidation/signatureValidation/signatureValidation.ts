import { string as zString, object as zObject } from "zod";
import { MercuryoSigRequest, MercuryoSigRequestPOST } from "../model/MercuryoSigRequest";
import { MoonPaySigRequest } from "../../typeValidation/model/MoonPaySigRequest";

export const mercuryoGET = zObject({
	walletAddress: zString(),
});

export const mercuryoPOST = zObject({
	message: zString(),
});

export const moonPaySchema = zObject({
	defaultCurrencyCode: zString(),
	theme: zString(),
	walletAddress: zString(),
	showOnlyCurrencies: zString().array(),
	baseCurrencyCode: zString(),
	baseCurrencyAmount: zString(),
});

export const validateMercuryoSchema = (
	request: MercuryoSigRequest,
): {
	success: boolean;
	data: MercuryoSigRequest | string;
} => {
	const result = mercuryoGET.safeParse(request);
	const { success } = result;

	if (success) {
		const data = result.data as MercuryoSigRequest;
		return { success, data };
	} else
		return {
			success,
			data: JSON.stringify(`Mercuryo Url signature schema Validation Error ${JSON.stringify(result)}`).replace(/\\/g, ""),
		};
};

export const validateMercuryoSchemaPOST = (
	request: MercuryoSigRequestPOST,
): {
	success: boolean;
	data: MercuryoSigRequestPOST | string;
} => {
	const result = mercuryoPOST.safeParse(request);
	const { success } = result;

	if (success) {
		const data = result.data as MercuryoSigRequestPOST;
		return { success, data };
	} else
		return {
			success,
			data: JSON.stringify(`Mercuryo Url signature schema Validation Error ${JSON.stringify(result)}`).replace(/\\/g, ""),
		};
};

export const validateMoonPaySchema = (
	request: MoonPaySigRequest,
): {
	success: boolean;
	data: MoonPaySigRequest | string;
} => {
	const result = moonPaySchema.safeParse(request);
	const { success } = result;

	if (success) {
		const data = result.data as MoonPaySigRequest;
		return { success, data };
	} else
		return {
			success,
			data: `MoonPay Url signature schema Validation Error ${JSON.stringify(result).replace(/,/g, ',\n').replace(/\\/g, '').replace(/{/g, '{\n').replace(/}/g, '}\n')}`
		};
};
