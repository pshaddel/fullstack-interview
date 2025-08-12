FROM node:24.0.0-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 3099

CMD ["npm", "run", "start:dev"]