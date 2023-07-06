import { ParsedQs } from "qs";

export class MercuryoSigRequest {
	constructor(walletAddress) {
		this._walletAddress = walletAddress;
	}

	get walletAddress(): string {
		return this._walletAddress;
	}

	private readonly _walletAddress: string;
}

export class MercuryoSigRequestPOST {
	constructor(message) {
		this._message = message;
	}

	get message(): string {
		return this._message;
	}

	private readonly _message: string;
}

export function toDto(query: ParsedQs): MercuryoSigRequest {
	const walletAddress = query.walletAddress as string;
	return new MercuryoSigRequest(walletAddress);
}

export function toPto(body: ParsedQs): MercuryoSigRequestPOST {
	const message = body?.message as string;
	return new MercuryoSigRequestPOST(message);
}
