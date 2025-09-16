
FROM node:20-bookworm
WORKDIR /repo
COPY ../../package.json ../../package-lock.json* ../../pnpm-lock.yaml* ../../yarn.lock* ./
COPY ./package.json ./
COPY ./tsconfig.json ./
COPY ./next.config.js ./
COPY ./tailwind.config.ts ./
COPY ./postcss.config.js ./
COPY ./app ./app
RUN npm i -g npm@latest && npm install && npm run build
EXPOSE 3000
CMD ["npm","start"]
