FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY . .

RUN npm install
RUN npm run build:css

EXPOSE 3000

CMD [ "npm", "start" ]
