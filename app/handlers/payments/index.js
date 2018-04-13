const { Composer } = require("telegraf");
const preCheckoutQueryHandler = require("./preCheckoutQuery");
const successfulPaymentHandler = require("./successfulPayment");
const callbackHandler = require("./callback");

const composer = new Composer();

composer.on("pre_checkout_query", preCheckoutQueryHandler);
composer.on("successful_payment", successfulPaymentHandler);
composer.on("callback_query", callbackHandler);

module.exports = composer;
