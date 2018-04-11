const mongoose = require("mongoose");

module.exports = async (url) =>
  new Promise((resolve, reject) => {
    mongoose.Promise = Promise;
    mongoose.set("debug", process.env.DB_DEBUG);
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
        console.log("MongoDB connection closed");
      })
      .on("open", () => {
        resolve();
      });
    mongoose.connect(url, options);
  });
