FROM node:14.11-alpine

WORKDIR /usr/src

COPY public             public
COPY server.js          server.js
COPY package.json       package.json
COPY package-lock.json  package-lock.json

RUN npm i

CMD [ "npm", "start" ]