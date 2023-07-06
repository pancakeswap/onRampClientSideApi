import { ParsedQs } from "qs";

export class MoonPaySigRequest {
	constructor(
		walletAddress: string,
		defaultCurrencyCode: string,
		baseCurrencyCode: string,
		baseCurrencyAmount: string,
		showOnlyCurrencies: string[],
		theme: string,
	) {
		this._walletAddress = walletAddress;
		this._defaultCurrencyCode = defaultCurrencyCode;
		this._baseCurrencyCode = baseCurrencyCode;
		this._baseCurrencyAmount = baseCurrencyAmount;
            this._showOnlyCurrencies = showOnlyCurrencies
		this._theme = theme;
	}

	get walletAddress(): string {
		return this._walletAddress;
	}

	get defaultCurrencyCode(): string {
		return this._defaultCurrencyCode;
	}
	get baseCurrencyCode(): string {
		return this._baseCurrencyCode;
	}
	get baseCurrencyAmount(): string {
		return this._baseCurrencyAmount;
	}
	get showOnlyCurrencies(): string[] {
		return this._showOnlyCurrencies;
	}
	get theme(): string {
		return this._theme;
	}

	private readonly _walletAddress: string;
	private readonly _defaultCurrencyCode: string;
	private readonly _baseCurrencyCode: string;
	private readonly _baseCurrencyAmount: string;
	private readonly _showOnlyCurrencies: string[];
	private readonly _theme: string;
}

export function toPtoMp(query: ParsedQs): MoonPaySigRequest {
	return new MoonPaySigRequest(
		query?.walletAddress as string,
		query?.defaultCurrencyCode as string,
		query?.baseCurrencyCode as string,
		query?.baseCurrencyAmount as string,
		query?.showOnlyCurrencies as string[],
		query?.theme as string,
	);
}
