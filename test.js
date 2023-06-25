const axios = require('axios');

const MOONPAY_EBDPOINT = `https://api.moonpay.com/v3/currencies/`;
const MERCURYO_ENDPOINT = `https://api.mercuryo.io/v1.6/widget/buy/rate`;
import { Connection, Repository } from 'typeorm';
import {
  UserEntity,
  MoonpayTxEntity,
  MercuryoTxEntity,
} from '../database/entities';
import { TX_STATUS } from '../database/entities/moonpayTxEntity';

const createUsers = async (con: Connection) => {
  const users: Array<UserEntity> = [];
  for (const _ of Array.from({ length: 1 })) {
    const walletAddress = '0x13E7f71a3E8847399547CE127B8dE420B282E4E4';
    const moonpayTransactions = [];
    const mercuryoTransactions = [];
    
    const user: Partial<UserEntity> = new UserEntity(
      walletAddress,
      moonpayTransactions,
      mercuryoTransactions,
    );
    users.push((await con.manager.save(user)) as UserEntity);
  }
  await createTransactions(con, users);
  // await readUsers(con);

};

const createTransactions = async (con: Connection, users: Array<UserEntity>) => {
  const posts: Array<MoonpayTxEntity> = [];
  for (const user of users) {
    const txProps: Partial<MoonpayTxEntity> = {
      transactionId: '123499999999999999999',
      status: TX_STATUS.PENDING,
      amount: 100,
      fiatCurrency: 'USD',
      cryptoCurrency: 'USDT',
    }
    const txProps2: Partial<any> = {
      transactionId: '24567777777777777777',
      status: TX_STATUS.COMPLETED,
      amount: 200,
      fiatCurrency: 'EUR',
      cryptoCurrency: 'BNB',
    }
    const tx1: Partial<MoonpayTxEntity> = new MoonpayTxEntity(txProps.transactionId, txProps.status, txProps.amount, txProps.cryptoCurrency, txProps.fiatCurrency);
    // const tx2: Partial<MercuryoTxEntity> = new MercuryoTxEntity(txProps2.transactionId, txProps2.status, txProps2.amount, txProps2.cryptoCurrency, txProps2.fiatCurrency);
    tx1.user = user;
    // tx2.user = user;
    posts.push((await con.manager.save(tx1)) as MoonpayTxEntity);
    // posts.push((await con.manager.save(tx2)) as MercuryoTxEntity);
  }
  // await readUsers(con);
};

const readUsers = async (con: Connection) => {
  const moonpayTransaction: Repository<MoonpayTxEntity> = con.getRepository(MoonpayTxEntity);
  const allUsers = await moonpayTransaction
      .createQueryBuilder('moonpayTransaction')
      .innerJoinAndSelect('moonpayTransaction.user', 'user')
      .where('user.walletAddress = :walletAddress', { walletAddress: '0x13E7f71a3E8847399547CE127B8dE420B282E4E4' })
      .getMany();

    console.log(allUsers);
};

export { createUsers };

async function fetchMercuryoQuote(fiatCurrency, cryptoCurrency, amount) {
  // Fetch data from endpoint 2
  try {
    const response = await axios.get(
      `${MERCURYO_ENDPOINT}?from=${fiatCurrency.toUpperCase()}&to=${cryptoCurrency.toUpperCase()}&amount=${
        amount
      }&widget_id=308e14df-01d7-4f35-948c-e17fa64bbc0d`,
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
    const res = await fetchMercuryoQuote('USD', 'ETH', '100')
    const result = res;
    console.log(result);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

const verifyMercuryoSig = async () => {
  const payload = {
  
    method: 'POST',
    message: `${'0x13E7f71a3E8847399547CE127B8dE420B282E4E4'}${'9r8egtsb27bzr101em7uw7zhcrlwdbp'}`
  }
  const config = {
    headers:{
      'x-api-signature': 'Yf8rJ6yXol3kKURB9lj1kG1LGA1UYCv9xQE3hrHXpEQ='
    }
  };
  try {
    const res = await axios.get(`https://pcs-onramp-api.com/generate-mercuryo-sig?walletAddress=${'0x13E7f71a3E8847399547CE127B8dE420B282E4E4'}`);
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
  ]
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
    showOnlyCurrencies: ['eth', 'dai', 'usdc'],

    walletAddresses: JSON.stringify(
      MOONPAY_SUPPORTED_CURRENCY_CODES.reduce(
        (acc, currencyCode) => ({
          ...acc,
          [currencyCode]: '0x13E7f71a3E8847399547CE127B8dE420B282E4E4',
        }),
        {},
      ),
    ),
  }
  try {
    const res = await axios.post('http://localhost:8002/create-user', { walletAddress: "0x13E7f71a3E8847399547CE127B8dE420B282E4E4" }
     );
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
  }
  try {
    const res = await axios.get('http://localhost:8000/user-ip');
    const result = res;
    console.log(result);
  } catch (error) {
    console.error('Error fetching data:', error.data);
  }
};

const fetchBSCQuote = async () => {
  const payload = {
  
    fiatCurrency: 'USD',
          cryptoCurrency: 'ETH',
          fiatAmount: '100',
         
  }
  try {
    const res = await axios.get('https://api.mercuryo.io/v1.6/sdk-partner/transactions?widget_id=a9f3d282-db2d-4364-ae62-602c5000f003&date_start=2020-12-11&date_end=2023-12-11',
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        // 'Authorization': `Api-Key sk_test_7zfPNfcZdStyiktn3lOJxOltGttayhC`,
      },
    });
    // console.log(res)
    const result = res;
    console.log(result.data.length);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};


getMoonPaySig()

