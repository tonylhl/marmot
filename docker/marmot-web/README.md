# marmot-web

---

[![docker pull][docker-pull-image]][docker-url]
[![docker pull][docker-size-image]][docker-url]
[![docker pull][docker-layers-image]][docker-url]

[docker-pull-image]: https://img.shields.io/docker/pulls/marmotjs/marmot-web.svg?style=flat-square&logo=dockbit
[docker-size-image]: https://img.shields.io/microbadger/image-size/marmotjs/marmot-web.svg?style=flat-square&logo=dockbit
[docker-layers-image]: https://img.shields.io/microbadger/layers/marmotjs/marmot-web.svg?style=flat-square&logo=dockbit
[docker-url]: https://hub.docker.com/r/marmotjs/marmot-web/

## production

should launch `marmot-mysql` service first.

[available environment variable](./#environment-variable)

```bash
$ docker run --rm --name marmot-web \
  -p 9900:9900 \
  -e MARMOT_HOST=127.0.0.1 \
  --link marmot-mysql:mysql-host \
  marmotjs/marmot-web
```

run as a service

```bash
$ docker run --name marmot-web \
  -p 9900:9900 \
  -e MARMOT_HOST=127.0.0.1 \
  --link marmot-mysql:mysql-host \
  -d marmotjs/marmot-web
```

open http://127.0.0.1:9900

if you want another hostname, please replace the `127.0.0.1`

---

Just for developer

## build image

```bash
$ cd ${PROJECT_ROOT_PATH}
$ docker build --no-cache --pull -t marmotjs/marmot-web .
$ docker push marmotjs/marmot-web
```

## development

start mysql:

```bash
# start
$ docker run --rm --name marmot-mysql \
  -p 3306:3306 \
  -v $HOME/marmot_home/mysql_data:/var/lib/mysql \
  -d marmotjs/marmot-mysql

# stop
$ docker stop marmot-mysql
```

start server:

```bash
npm run dev
```

## test

```bash
npm test  # test migration then test web server
npm run test-local  # only test web server
npm run cov  # test and output test coverage
```

## environment-variable

variable name   | description                                   | default value
---             | ---                                           | ---
MYSQL_HOST      | mysql server ip                               | 127.0.0.1
MYSQL_PORT      | mysql port                                    | 3306
MARMOT_HOST     | used for notification message template        | 127.0.0.1
AWS_DISABLE_SSL | set sslEnabled:false for aws sdk              | false
AWS_PROXY_URI   | use proxy-agent and set proxy uri for asw sdk | null
