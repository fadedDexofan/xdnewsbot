FROM mhart/alpine-node
ENV NODE_ENV production
WORKDIR /app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
RUN npm i -g pm2
COPY . .
EXPOSE 3000
CMD npm run docker
