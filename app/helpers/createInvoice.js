const { Markup } = require("telegraf");

module.exports = (event) => {
  const buttonsPayload = [Markup.payButton("💳 Оплатить")];
  if (event.url) buttonsPayload.push(Markup.urlButton("Подробнее", event.url));
  return {
    provider_token: process.env.PAYMENT_TOKEN,
    start_parameter: event.id,
    title: event.name,
    description: event.description,
    currency: "RUB",
    photo_url: event.photoUrl,
    need_name: true,
    need_phone_number: false,
    need_email: true,
    is_flexible: false,
    send_email_to_provider: true,
    send_phone_number_to_provider: false,
    need_shipping_address: false,
    provider_data: {
      receipt: {
        items: [
          {
            description: event.name,
            quantity: "1.00",
            amount: { value: `${event.price}.00`, currency: "RUB" },
            vat_code: 1,
          },
        ],
      },
    },
    prices: [{ label: event.name, amount: Math.trunc(event.price * 100) }],
    payload: { name: event.name },
    reply_markup: Markup.inlineKeyboard(buttonsPayload),
  };
};
