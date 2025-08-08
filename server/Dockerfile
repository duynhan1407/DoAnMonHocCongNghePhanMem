# Backend Dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install && npm rebuild bcrypt --build-from-source

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
