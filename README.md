# Marmot

---

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![node version][node-image]][node-url]
[![npm download][download-image]][download-url]
[![docker pull][docker-image]][docker-url]

[npm-image]: https://img.shields.io/npm/v/marmot-web.svg?style=flat-square
[npm-url]: https://npmjs.org/package/marmot-web
[travis-image]: https://img.shields.io/travis/macacajs/marmot.svg?style=flat-square
[travis-url]: https://travis-ci.org/macacajs/marmot
[coveralls-image]: https://img.shields.io/codecov/c/github/macacajs/marmot.svg?style=flat-square
[coveralls-url]: https://codecov.io/gh/macacajs/marmot
[node-image]: https://img.shields.io/badge/node.js-%3E=_8-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/
[download-image]: https://img.shields.io/npm/dm/marmot-web.svg?style=flat-square
[download-url]: https://npmjs.org/package/marmot-web
[docker-image]: https://img.shields.io/docker/pulls/macacajs/marmot-web.svg?style=flat-square
[docker-url]: https://hub.docker.com/r/macacajs/marmot-web/

> Marmot Server Side

# Prod

- start marmot-mysql

```
docker run --name marmot-mysql \
  -v $HOME/marmot_home/mysql_data:/var/lib/mysql \
  -d marmotjs/marmot-mysql
```

- start marmot-web

```bash
$ docker run --name marmot-web \
  -p 9900:9900 \
  --link marmot-mysql:mysql-host \
  -d marmotjs/marmot-web
```

- start marmot-nginx

```bash
$ docker run --name marmot-nginx \
  -p 9920:80 \
  -v $HOME/marmot_home/static:/usr/share/nginx/html:ro \
  -d marmotjs/marmot-nginx
```

# Dev

- start marmot-mysql

```
$ docker run --name marmot-mysql \
  -d marmotjs/marmot-mysql
```

- start marmot-web

```bash
npm run dev
npm test
```

## License

The MIT License (MIT)
