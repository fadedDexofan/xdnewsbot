FROM mhart/alpine-node:latest

WORKDIR /bot
COPY package.json yarn.lock .env ./
COPY app ./app
ENV NODE_ENV=production
RUN yarn install && npm install -g pm2

FROM alpine:3.6
COPY --from=0 /usr/bin/node /usr/bin/
COPY --from=0 /usr/lib/libgcc* /usr/lib/libstdc* /usr/lib/
WORKDIR /bot
COPY --from=0 /bot .
COPY . .
EXPOSE 3000
CMD ["yarn", "start"]
