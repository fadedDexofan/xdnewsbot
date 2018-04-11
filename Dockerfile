FROM mhart/alpine-node:latest

WORKDIR /bot
COPY package.json yarn.lock .env ./
COPY app ./app
ENV NODE_ENV=production
RUN apk add --no-cache make gcc g++ python
RUN yarn install && npm install -g pm2

EXPOSE 8443
CMD ["npm", "start"]
