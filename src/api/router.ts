import express, { Router } from "express";
// import app from "@app";
import { generateMercuryoSig, generateMoonPaySig } from './verification/signatureHandlers';
import { fetchMercuryoIpAvailability, fetchMoonPayIpAvailability, fetchMoonPayQuote, fetchProviderQuotes, fetchmercuryoQuote } from "./proxy/proxyHandlers";
import { fetchIpDetails } from "./proxy/fetchers/ipAvailabilityFetchers";
import { MercuryoTestWebhook, MoonPayTestWebhook } from "./webhookCallbacks/webhookHandlers";

const router: Router = express.Router()

//router routes
router.route("/generate-mercuryo-sig").post(generateMercuryoSig).get(generateMercuryoSig)
router.route("/generate-moonpay-sig").post(generateMoonPaySig)

router.route("/fetch-mercuryo-quote").post(fetchmercuryoQuote)
router.route("/fetch-moonpay-quote").post(fetchMoonPayQuote)
router.route("/fetch-provider-quotes").post(fetchProviderQuotes)


router.route("/fetch-moonpay-availability").get(fetchMoonPayIpAvailability)
router.route("/fetch-mercuryo-availability").get(fetchMercuryoIpAvailability)
router.route('/user-ip').get(fetchIpDetails)

//webhooks
router.route('/webhook').post(MoonPayTestWebhook)
router.route('/webhook-mercuryo').post(MercuryoTestWebhook)

export default router
