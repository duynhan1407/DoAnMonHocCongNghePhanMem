# Backend Dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install && npm rebuild bcrypt --build-from-source

COPY . .

EXPOSE 8000

CMD ["npm", "start"]
