// app.config.js
import "dotenv/config";

export default {
  expo: {
    name: "DailyEnglishApp",
    slug: "DailyEnglishApp",
    scheme: "dailyenglishapp",
    extra: {
      API_BASE: process.env.API_BASE ?? "http://localhost:8081",
      // add more keys here
    },
    android: {
      package: "com.sendoan.DailyEnglishApp",
    },
    ios: {
      bundleIdentifier: "com.sendoan.DailyEnglishApp",
    },
  },
};
