
import { ParsedQs } from "qs";

export class ProviderIPAvailability {
	constructor(userIp) {
		this._userIp = userIp;
	}

	get userIp(): string {
		return this._userIp;
	}

	private readonly _userIp: string;
}

export function toDtoIP(query: ParsedQs): ProviderIPAvailability {
	const ip = query.userIp as string;
	return new ProviderIPAvailability(ip);
}

