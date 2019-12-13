FROM node:12.13.1-alpine3.10

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . /usr/src/app

RUN npm run tsc

EXPOSE 8080

CMD [ "npm", "start" ]