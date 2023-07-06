import { get } from "./services/axios";

const axios = require('axios');
const MOONPAY_EBDPOINT = `https://api.moonpay.com/v3/currencies/`;
const MERCURYO_ENDPOINT = `https://api.mercuryo.io/v1.6/widget/buy/rate`;

async function fetchMercuryoQuote(fiatCurrency, cryptoCurrency, amount) {
  // Fetch data from endpoint 2
  try {
    const response = await axios.get(
      `${MERCURYO_ENDPOINT}?from=${fiatCurrency.toUpperCase()}&to=${cryptoCurrency.toUpperCase()}&amount=${amount}&widget_id=308e14df-01d7-4f35-948c-e17fa64bbc0d`,
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

const getMercuryoSig = async () => {
  try {
    // const res = await axios.get('http://localhost:8081/generate-mercuryo-sig', {

    //   method: 'GET',
    //   params: {
    //     walletAddress: "0x13E7f71a3E8847399547CE127B8dE420B282E4E4",
    //   }
    // });
    const res = await fetchMercuryoQuote('USD', 'ETH', '100');
    const result = res;
    console.log(result);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

const verifyMercuryoSig = async () => {
  const payload = {
    method: 'POST',
    message: `${'0x13E7f71a3E8847399547CE127B8dE420B282E4E4'}${'9r8egtsb27bzr101em7uw7zhcrlwdbp'}`,
  };
  const config = {
    headers: {
      'x-api-signature': 'Yf8rJ6yXol3kKURB9lj1kG1LGA1UYCv9xQE3hrHXpEQ=',
    },
  };
  try {
    const res = await axios.get(
      `https://pcs-onramp-api.com/generate-mercuryo-sig?walletAddress=${'0x13E7f71a3E8847399547CE127B8dE420B282E4E4'}`,
    );
    const result = res.data;
    console.log(result);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

const getMoonPaySig = async () => {
  const MOONPAY_SUPPORTED_CURRENCY_CODES = [
    'eth',
    'eth_arbitrum',
    'eth_optimism',
    'eth_polygon',
    'weth',
    'wbtc',
    'matic_polygon',
    'polygon',
    'usdc_arbitrum',
    'usdc_optimism',
    'usdc_polygon',
  ];
  const p = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    type: 'MOONPAY',
    defaultCurrencyCode: 'eth',
    baseCurrencyCode: 'usd',
    baseCurrencyAmount: '30',
    redirectUrl: 'https://pancakeswap.finance',
    theme: 'light',
    showOnlyCurrencies: ['eth', 'dai', 'usdc', 'bnb', 'busd'],

    walletAddress: '0x13E7f71a3E8847399547CE127B8dE420B282E4E4',
  };
  try {
    const res = await axios.post('http://localhost:3000/api/moonpay-url-sign', p);
    const result = res.data;
    console.log(result);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

const generateBscSig = async () => {
  const payload = {
    fiatCurrency: 'USD',
    cryptoCurrency: 'BTC',
    fiatAmount: '100',
    cryptoNetwork: 'BSC',
    paymentMethod: 'CARD',
  };
  try {
    const res = await axios.get('https://pcs-onramp-api.com/user-ip');
    const result = res;
    console.log(result);
  } catch (error) {
    console.error('Error fetching data:', error.data);
  }
};

const fetchBSCQuote = async () => {
  const payload = {
    fiatCurrency: 'USD',
    cryptoCurrency: 'USDC',
    fiatAmount: '120',
    network: 'ETHEREUM',
  };
  try {
    const res = await axios.post('http://localhost:8081/fetch-provider-quotes', payload);
    // console.log(res)
    const result = res;
    res.data.result.forEach((result) => console.log(result));
    //     console.log(result.data.result);
  } catch (error) {
    console.error('Error fetching data:', error.response);
  }
};

async function fetchMoonpayQuote(baseAmount, currencyCode, outputCurrency) {
  // Fetch data from endpoint 2
  console.log('hey');

  try {
    const response = await axios.get(
      `${MOONPAY_EBDPOINT}${outputCurrency.toLowerCase()}/buy_quote/?apiKey=${'pk_live_Ch5fat39X8NvMZwih2k7hK4sDrKanSPz'}&baseCurrencyAmount=${baseAmount}&&baseCurrencyCode=${currencyCode.toLowerCase()}`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );
    //   console.log(response)

    const result = response.data;
    //       console.log(result)
    return { code: 'MOONPAY', result: result, error: false };
  } catch (error) {
    console.log(error);

    return { code: 'MOONPAY', result: error.response.data, error: true };
  }
}

async function fetchMoonpayAvailability(userIp) {
  // Fetch data from endpoint 2
  try {
    const response = await axios.get(
      `https://api.moonpay.com/v4/ip_address?apiKey=${'pk_live_Ch5fat39X8NvMZwih2k7hK4sDrKanSPz'}&ipAddress=${userIp}`,
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

async function fetchMercuryoAvailability(userIp) {
  // Fetch data from endpoint 2
  try {
    const response = await axios.get(`https://api.mercuryo.io/v1.6/public/data-by-ip?ip=${userIp}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const result = response.data.data;
    return { code: 'Mercuryo', result: result, error: false };
  } catch (error) {
    return { code: 'Mercuryo', result: error.response.data, error: true };
  }
}

const fetchProviderAvailability = async (userIp) => {
      const payload = {
            fiatCurrency: 'usd',
            cryptoCurrency: 'btcc',
            amount: '100',
            network: 'BSC',
          };
	try {
	  const res = await get('http://localhost:8000/fetch-moonpay-availability', { params: {  }});
	  // console.log(res)
	  const result = res;
	      console.log(result);
	} catch (error) {
	  console.log(error.response);
	} 
      };
//   fetchMoonpayQuote(120, 'usdd', 'eth').then(console.log)
// fetchBSCQuote();
//   fetchMercuryoQuote('usd', 'usdc', 120, 'TRON').then(console.log)
// fetchMercuryoAvailability('145.224.68.156').then(console.log);
fetchProviderAvailability('145.224.68.156').then(console.log);

