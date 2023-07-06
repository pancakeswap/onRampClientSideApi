import { string as zString, object as zObject } from "zod";
import { ProviderIPAvailability } from "typeValidation/model/ProviderIp";

export const ipSchema = zObject({
	userIp: zString(),
});

export const validateIpSchema = (
	request: ProviderIPAvailability,
): {
	success: boolean;
	data: ProviderIPAvailability | string;
} => {
	const result = ipSchema.safeParse(request);
	const { success } = result;

	if (success) {
		const data = result.data as ProviderIPAvailability;
		return { success, data };
	} else
		return {
			success,
			data: JSON.stringify(`Provider IP schema Validation Error ${JSON.stringify(result)}`).replace(/\\/g, ""),
		};
};