const { Visitor } = require("../../models");
const { isEmail } = require("validator");
const { profileMenu } = require("../../buttons");

const processMessage = async (ctx) => {
  const userState = ctx.session.USER_STATE;
  if (userState) {
    const user = await Visitor.findOne({ userId: ctx.from.id }).exec();
    if (ctx.message.text === "/cancel") {
      ctx.session.USER_STATE = undefined;
      ctx.replyWithMarkdown(...profileMenu(user));
      return;
    }
    if (userState === "ASK_EMAIL") {
      const email = ctx.message.text;
      if (!isEmail(email)) {
        ctx.reply(
          "Указана неверная эл. почта. Повторите попытку.\n\nОтправьте /cancel для отмены.",
        );
      } else {
        user.email = email;
        await user.save();
        ctx.replyWithMarkdown(`*Ваш текущая эл. почта:* ${user.email}`);
        ctx.session.USER_STATE = undefined;
        ctx.replyWithMarkdown(...profileMenu(user));
      }
    } else if (userState === "ASK_NAME") {
      const name = ctx.message.text;
      if (!/^[А-Я][а-я]+\s[А-Я][а-я]+/.test(name)) {
        ctx.reply(
          "Пожалуйста, укажите ваши имя и фамилию с большой буквы через пробел.\nНапример: Иван Иванов\n\nОтправьте /cancel для отмены.",
        );
      } else {
        user.name = name;
        await user.save();
        ctx.replyWithMarkdown(`*Ваше текущее имя:* ${user.name}`);
        ctx.session.USER_STATE = undefined;
        ctx.replyWithMarkdown(...profileMenu(user));
      }
    }
  }
};

module.exports = processMessage;
