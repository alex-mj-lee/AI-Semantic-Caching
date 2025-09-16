
FROM node:20-bookworm
WORKDIR /app
COPY ./package.json ./
COPY ./package-lock.json* ./
COPY ./tsconfig.json ./
COPY ./src ./src
COPY ./lib ./lib
RUN npm i -g npm@latest && npm install && npm run build
EXPOSE 4000
CMD ["node","dist/src/index.js"]
