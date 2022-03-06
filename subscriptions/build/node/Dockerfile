FROM node:16-alpine

WORKDIR /usr/src

COPY app                app
COPY bin                bin
COPY public             public
COPY package.json       package.json
COPY package-lock.json  package-lock.json

RUN npm i