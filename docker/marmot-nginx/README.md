# marmot-nginx

---

[![docker pull][docker-pull-image]][docker-url]
[![docker pull][docker-size-image]][docker-url]
[![docker pull][docker-layers-image]][docker-url]

[docker-pull-image]: https://img.shields.io/docker/pulls/marmotjs/marmot-nginx.svg?style=flat-square&logo=dockbit
[docker-size-image]: https://img.shields.io/microbadger/image-size/marmotjs/marmot-nginx.svg?style=flat-square&logo=dockbit
[docker-layers-image]: https://img.shields.io/microbadger/layers/marmotjs/marmot-nginx.svg?style=flat-square&logo=dockbit
[docker-url]: https://hub.docker.com/r/marmotjs/marmot-nginx/

## production

```bash
$ docker run --name marmot-nginx \
  -p 9920:80 \
  -v $HOME/marmot_home/static:/usr/share/nginx/html:ro \
  -d marmotjs/marmot-nginx
```

---

Just for deveoper

## build image

```bash
$ cd docker/marmot-nginx
$ docker build --pull -t marmotjs/marmot-nginx .
$ docker push marmotjs/marmot-nginx
```
