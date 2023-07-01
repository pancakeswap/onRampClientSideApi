import axios from 'axios';
import { post } from '../services/axios';
import { sign } from '../utils/rsa_sig';
import config from '../config/config';

const MOONPAY_EBDPOINT = `https://api.moonpay.com/v3/currencies/`;
const MERCURYO_ENDPOINT = `https://api.mercuryo.io/v1.6/widget/buy/rate`;

export async function fetchMoonpayQuote(fiatAmount: number, cryptoCurrency: string, fiatCurrency: string) {
  try {
    const response = await axios.get(
      `${MOONPAY_EBDPOINT}${cryptoCurrency.toLowerCase()}/buy_quote/?apiKey=${
        config.moonpayLiveKey
      }&baseCurrencyAmount=${fiatAmount}&&baseCurrencyCode=${fiatCurrency.toLowerCase()}`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );
    const result = response.data;
    return { code: 'MoonPay', result: result, error: false };
  } catch (error) {
    return { code: 'MoonPay', result: error.response.data, error: true };
  }
}

export async function fetchMercuryoQuote(
  fiatCurrency: string,
  cryptoCurrency: string,
  amount: string,
  network: string,
) {
  try {
    const response = await axios.get(
      `${MERCURYO_ENDPOINT}?from=${fiatCurrency.toUpperCase()}&to=${cryptoCurrency.toUpperCase()}&amount=${amount}&network=${network}&widget_id=a9f3d282-db2d-4364-ae62-602c5000f003`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );
    const result = response.data.data;
    return { code: 'Mercuryo', result: result, error: false };
  } catch (error) {
    return { code: 'Mercuryo', result: error.response.data, error: true };
  }
}

// for bsc connect we need to axios.get our own custom api endpoint as even get requests require
// sig validation
export async function fetchBinanceConnectQuote(payloada: any) {
  const payload = {
    fiatCurrency: 'USD',
    cryptoCurrency: 'BUSD',
    fiatAmount: '100',
    cryptoNetwork: 'BSC',
    paymentMethod: 'CARD',
  };
  // const validPayload = bscQuotepayloadSchema.safeParse(payload);
  // if (!validPayload.success) {
  //   throw new Error('payload has the incorrect shape. please check you types');
  // }

  try {
    const merchantCode = 'pancake_swap_test';
    const timestamp = Date.now().toString();

    const payloadString = JSON.stringify(payload);
    const contentToSign = `${payloadString}&merchantCode=${merchantCode}&timestamp=${timestamp}`;

    const signature = sign(contentToSign, process.env.PRIVATE_KEY.replace(/\\n/g, '\n'));
    const endpoint = `https://sandbox.bifinitypay.com/bapi/fiat/v1/public/open-api/connect/get-quote`;

    // NEED TO LOK UP API DOCS FOR RET TYPE WILL DO LATER
    const response = await post<any, any>(endpoint, payload, {
      headers: {
        'Content-Type': 'application/json',
        merchantCode,
        timestamp,
        'x-api-signature': signature,
      },
    });
    const result = response;

    return { code: 'BINANCE_CONNECT', result: result, error: false };
  } catch (error) {
    return { code: 'BINANCE_CONNECT', result: error, error: true };
  }
}
