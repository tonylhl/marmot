FROM node:8-alpine

RUN apk --no-cache add python bash build-base ca-certificates

COPY . /root/marmot-web

WORKDIR /root/marmot-web

ENV MYSQL_HOST=mysql-host \
    EGG_WORKERS=1

RUN npm config set unsafe-perm=true \
  && npm i --registry=https://registry.npm.taobao.org \
  && ln -s /root/logs .

HEALTHCHECK --interval=10s --retries=6 \
  CMD wget -O /dev/null localhost:9900 || echo 1

ENTRYPOINT ["./entrypoint.sh"]

CMD ["npm", "start"]
