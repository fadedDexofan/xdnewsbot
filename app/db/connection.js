const mongoose = require("mongoose");
const { logger } = require("../utils");

const DEBUG = process.env.NODE_ENV === "development";

module.exports = async (url) =>
  new Promise((resolve, reject) => {
    mongoose.Promise = Promise;
    mongoose.set("debug", DEBUG);
    const options = {
      autoIndex: process.env.DB_AUTO_INDEX,
      bufferMaxEntries: 0,
      reconnectInterval: 500,
      reconnectTries: Number.MAX_VALUE,
    };
    mongoose.connection
      .on("error", (error) => {
        reject(error);
      })
      .on("close", () => {
        logger.info("Соединение с MongoDB закрыто");
      })
      .on("open", () => {
        resolve();
      });
    mongoose.connect(url, options);
  });
