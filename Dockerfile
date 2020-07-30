FROM node:14

WORKDIR /app

COPY *.js package* ./

RUN npm install

CMD ["node", "./index.js"]