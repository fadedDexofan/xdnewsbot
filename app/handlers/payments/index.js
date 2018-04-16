const { Composer } = require("telegraf");
const preCheckoutQueryHandler = require("./preCheckoutQuery");
const successfulPaymentHandler = require("./successfulPayment");
const checkoutHandler = require("./checkout");

const composer = new Composer();

composer.on("pre_checkout_query", preCheckoutQueryHandler);
composer.on("successful_payment", successfulPaymentHandler);
composer.on("callback_query", checkoutHandler);

module.exports = composer;
