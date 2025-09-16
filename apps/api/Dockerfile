
FROM node:20-bookworm
WORKDIR /repo
COPY ../../package.json ../../package-lock.json* ../../pnpm-lock.yaml* ../../yarn.lock* ./
COPY ./package.json ./
COPY ./tsconfig.json ./
COPY ./src ./src
COPY ./lib ./lib
RUN npm i -g npm@latest && npm install && npm run build
EXPOSE 4000
CMD ["node","dist/src/index.js"]
