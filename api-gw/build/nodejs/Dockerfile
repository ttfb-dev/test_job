FROM node:14-alpine

WORKDIR /usr/src/app

COPY config             config
COPY package.json       package.json
COPY package-lock.json  package-lock.json
COPY server.js          server.js

RUN npm i

CMD [ "npm", "run", "start" ]