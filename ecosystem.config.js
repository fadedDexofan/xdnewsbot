module.exports = {
  apps: [
    {
      name: "xdnews-bot",
      script: "app",
      watch: ["app"],
      env_production: {
        NODE_ENV: "production",
      },
      restart_delay: 4000,
    },
  ],
};
