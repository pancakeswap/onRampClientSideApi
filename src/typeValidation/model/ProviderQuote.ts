
import { ParsedQs } from "qs";

export class ProviderQuote {
	constructor(fiatCurrency: string, cryptoCurrency: string, amount: string, network: string) {
		this._fiatCurrency = fiatCurrency;
            this._cryptoCurrency = cryptoCurrency;
            this._amount = amount
            this._network = network
	}

	get fiatCurrency(): string {
		return this._fiatCurrency;
	}
      get cryptoCurrency(): string {
		return this._cryptoCurrency;
	}
      get amount(): string {
		return this._amount;
	}
      get network(): string {
		return this._network;
	}

	private readonly _fiatCurrency: string;
	private readonly _cryptoCurrency: string;
	private readonly _amount: string;
	private readonly _network: string;

}

export function toPtoQU(query: ParsedQs): ProviderQuote {
	return new ProviderQuote(
		query?.fiatCurrency as string,
		query?.cryptoCurrency as string,
		query?.amount as string,
		query?.network as string,
	);
}

