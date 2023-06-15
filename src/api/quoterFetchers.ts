import axios from 'axios';
import { post } from '../services/axios';
import { sign } from '../utils/rsa_sig';

const MOONPAY_EBDPOINT = `https://api.moonpay.com/v3/currencies/`;
const MERCURYO_ENDPOINT = `https://sandbox-api.mrcr.io/v1.6/widget/buy/rate`;

export async function fetchMoonpayQuote(baseAmount: number, currencyCode: string, outputCurrency: string) {
    // Fetch data from endpoint 2
    try {
        const response = await axios.get(
            `${MOONPAY_EBDPOINT}${outputCurrency.toLowerCase()}/buy_quote/?apiKey=pk_test_1Ibe44lMglFVL8COOYO7SEKnIBrzrp54&baseCurrencyAmount=${baseAmount}&&baseCurrencyCode=${currencyCode.toLowerCase()}`,
            {
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            },
          );
      const result = response.data;
      return { code: 'MOONPAY', result: result, error: false };
    } catch (error) {
      return { code: 'MOONPAY', result: error, error: true };
    }
  }

export async function fetchMercuryoQuote(fiatCurrency: string, cryptoCurrency: string, amount: string) {
  // Fetch data from endpoint 2
  try {
    const response = await axios.get(
      `${MERCURYO_ENDPOINT}?from=${fiatCurrency.toUpperCase()}&to=${cryptoCurrency.toUpperCase()}&amount=${
        amount
      }&widget_id=64d1f9f9-85ee-4558-8168-1dc0e7057ce6`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );
    const result = response.data;
    return { status: 'MERCURYO', result: result, error: false };
  } catch (error) {
    return { code: 'MERCURYO', result: error, error: true };
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

    }
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
    })
    const result = response

  return { status: 'BINANCE_CONNECT', result: result, error: false };
}
  catch (error) {
    return { code: 'BINANCE_CONNECT', result: error, error: true };
  }
}
