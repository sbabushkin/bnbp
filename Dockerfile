FROM cr.yandex/crpsqfet7u7hat9rhlh8/alpine-node:14.17.3

RUN apk add --no-cache python3
RUN apk add --no-cache make gcc
RUN apk add --no-cache g++
RUN apk add --no-cache bash tzdata
ENV TZ Europe/Moscow
RUN npm set registry https://npm.vmassive.ru/

WORKDIR /app
COPY ./ ./
RUN rm -rf node_modules
RUN yarn install --frozen-lockfile

CMD [ "npm", "start" ]
