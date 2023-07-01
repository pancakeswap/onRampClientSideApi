import express, { Router } from "express";
// import app from "@app";
import { fetchBscAvailability, fetchBscQuote, generateBinanceConnectSig, generateMercuryoSig, generateMoonPaySig } from './verification/signatureHandlers';
import { fetchBinanceConnectIpAvailability, fetchMercuryoIpAvailability, fetchMoonPayIpAvailability, fetchProviderQuotes } from "./proxy/proxyHandlers";
import { fetchBinanceConnectQuote } from "./proxy/fetchers/ProviderQuoteFetchers";
import { fetchIpDetails, fetchMercuryoAvailability } from "./proxy/fetchers/ipAvailabilityFetchers";
import { TransactionUpdaterWebHook } from "./webhookCallbacks/types";
import { getMessages, getUserMessages } from "../database/queries";


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
router.route('/webhook').post(TransactionUpdaterWebHook)
router.route('/messages').post(getMessages)
router.route('/get-messages').get(getUserMessages)

export default router
