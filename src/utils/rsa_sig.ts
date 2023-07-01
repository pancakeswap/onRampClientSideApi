import crypto from 'crypto'

export function sign(srcData: string, privateKey: string): string {
    const key = crypto.createPrivateKey(privateKey);
    const signer = crypto.createSign("RSA-SHA256");
    signer.update(srcData);
    const signature = signer.sign(key);
    return signature.toString("base64");
}

export const generateHMAC = (secretKey: string, message: string) => {
		return crypto.createHmac("sha256", secretKey).update(message).digest("hex");
}

export const populate_GET_RequestSigContent = (walletAddress: string, merchantCode: string, timestamp: string) => {
  return `cryptoAddress=${walletAddress}&cryptoNetwork=ERC20&merchantCode=${merchantCode}&timestamp=${timestamp}`
}

export const populatBuildTradeParams = (params) => {
  return `?cryptoCurrency=${params.cryptoCurrency}&fiatCurrency=${params.fiatCurrency}&orderAmount=${params.amount}&cryptoAddress=${params.walletAddress}&cryptoNetwork=BNB&merchantCode=pancake_swap_test&timestamp=${params.timestamp}&signature=${params.signature}`
}

export const populateMoonPayUrl = (moonPayParams) => {
  const supportedTokens = moonPayParams.showOnlyCurrencies
  return `&theme=${moonPayParams.theme}&colorCode=%2382DBE3&defaultCurrencyCode=${moonPayParams.defaultCurrencyCode}&baseCurrencyCode=${moonPayParams.baseCurrencyCode}&baseCurrencyAmount=${moonPayParams.baseCurrencyAmount}&walletAddresses=${moonPayParams.encodedWalletAddresses}&showOnlyCurrencies=%5B%2C${supportedTokens[0]}%2Cusdc%5D%5B${supportedTokens[1]}%2Cusdc%2Cusdc%5D%5Beth%2C${supportedTokens[2]}%2Cusdc%5D`
}