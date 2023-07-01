import express, { Router } from "express";
// import app from "@app";
import { fetchBscQuote, generateBinanceConnectSig, generateMercuryoSig, generateMoonPaySig } from './verification/signatureHandlers';
import { fetchBinanceConnectIpAvailability, fetchMercuryoIpAvailability, fetchMoonPayIpAvailability, fetchProviderQuotes } from "./proxy/proxyHandlers";
import { fetchIpDetails } from "./proxy/fetchers/ipAvailabilityFetchers";
import { MercuryoTestWebhook, MoonPayTestWebhook } from "./webhookCallbacks/webhookHandlers";

const router: Router = express.Router()

//router routes
router.route("/generate-mercuryo-sig").post(generateMercuryoSig).get(generateMercuryoSig)
router.route("/generate-moonpay-sig").post(generateMoonPaySig)
router.route("/generate-binance-connect-sig").post(generateBinanceConnectSig).get(generateBinanceConnectSig)

router.route("/fetch-bsc-quote").post(fetchBscQuote)
router.route("/fetch-mercuryo-quote").post(fetchProviderQuotes)

router.route("/fetch-bsc-availability").post(fetchBinanceConnectIpAvailability)
router.route("/fetch-moonpay-availability").get(fetchMoonPayIpAvailability)
router.route("/fetch-mercuryo-availability").get(fetchMercuryoIpAvailability)
router.route('/user-ip').get(fetchIpDetails)

//webhooks
router.route('/webhook').post(MoonPayTestWebhook)
router.route('/webhook-mercuryo').post(MercuryoTestWebhook)

export default router
