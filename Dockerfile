FROM node:19
RUN npm install -g pnpm
WORKDIR /usr/src/app

COPY package*.json ./


RUN pnpm install

COPY . .

RUN pnpm run build

CMD [ "pnpm", "start:dev" ]