FROM node:19
RUN npm install -g pnpm
WORKDIR /usr/src/app

COPY package*.json ./


RUN pnpm install

COPY . .

RUN pnpm run build
EXPOSE 3000

CMD [ "pnpm", "start:dev" ]