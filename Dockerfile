FROM mhart/alpine-node:latest
WORKDIR /app
COPY package.json yarn.lock .env ./
ENV NODE_ENV=production
RUN yarn install && npm install -g pm2 


FROM mhart/alpine-node:base
WORKDIR /app
COPY --from=0 /app .
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
