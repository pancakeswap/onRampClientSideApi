import axios from 'axios';
import { post } from '../../../services/axios';
import { sign } from '../../../utils/rsa_sig';
import { checkIpPayloadSchema } from '../../../typeValidation/validation';
import config from '../../../config/config';
const geoip = require('geoip-lite');

export async function fetchMoonpayAvailability(userIp: string) {
    // Fetch data from endpoint 2
    try {
        const response = await axios.get(
            `https://api.moonpay.com/v4/ip_address?apiKey=${config.moonpayLiveKey}&ipAddress=${userIp}`,
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

export async function fetchMercuryoAvailability(userIp: string) {
  // Fetch data from endpoint 2
  try {
    const response = await axios.get(
        `https://api.mercuryo.io/v1.6/public/data-by-ip?ip=${userIp}`,
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
export async function fetchBinanceConnectAvailability(userIp: any) {
    const validPayload = checkIpPayloadSchema.safeParse(userIp);
    if (!validPayload.success) {
      throw new Error('payload has the incorrect shape. please check you types');
    }
    try {
    const merchantCode = 'pancake_swap_test';
    const timestamp = Date.now().toString();

    const payloadString = JSON.stringify(userIp);
    const contentToSign = `${payloadString}&merchantCode=${merchantCode}&timestamp=${timestamp}`;

    const signature = sign(contentToSign, process.env.PRIVATE_KEY.replace(/\\n/g, '\n'));
    const endpoint = `https://sandbox.bifinitypay.com/bapi/fiat/v1/public/open-api/connect/check-ip-address`;

    // NEED TO LOK UP API DOCS FOR RET TYPE WILL DO LATER
    const response = await post<any, any>(endpoint, {userIp}, {
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
export const fetchIpDetails = async(req, res) => {
  const ipAddress = 
  req.headers['cf-connecting-ip'] ||
  req.headers['x-real-ip'] ||
  req.headers['x-forwarded-for'] ||
  req.socket.remoteAddress || ''
  
  const geo = geoip.lookup(ipAddress);

  const country = geo ? geo.country : null;
  const state = geo && geo.country === 'US' ? geo.region : null;

  const response = {
    ipAddress,
    country,
    state
  };

  res.json(response);
}


