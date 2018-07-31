FROM node:8-alpine

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

RUN apk --no-cache add bash

COPY . /root/marmot-web

WORKDIR /root/marmot-web

ENV MYSQL_HOST=mysql-host

RUN npm install --production --verbose && ln -s /root/logs .

HEALTHCHECK --interval=10s --retries=6 \
  CMD wget -O /dev/null localhost:9900 || echo 1

ENTRYPOINT ["./entrypoint.sh"]

EXPOSE 9900
CMD ["npm", "start"]
