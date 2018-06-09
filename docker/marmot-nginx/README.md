# marmot-nginx

---

[![docker pull][docker-image]][docker-url]
[docker-image]: https://img.shields.io/docker/pulls/marmotjs/marmot-nginx.svg?style=flat-square
[docker-url]: https://hub.docker.com/r/marmotjs/marmot-nginx/

## build image

```bash
$ cd docker/marmot-nginx
$ docker build -t marmotjs/marmot-nginx .
$ docker push marmotjs/marmot-nginx
```

## production

```bash
$ docker run --name marmot-nginx \
  -p 9920:80 \
  -v $HOME/marmot_home/static:/usr/share/nginx/html:ro \
  -d marmotjs/marmot-nginx
```
