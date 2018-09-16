# marmot-mysql

---

[![docker pull][docker-pull-image]][docker-url]
[![docker pull][docker-size-image]][docker-url]
[![docker pull][docker-layers-image]][docker-url]

[docker-pull-image]: https://img.shields.io/docker/pulls/marmotjs/marmot-mysql.svg?style=flat-square&logo=dockbit
[docker-size-image]: https://img.shields.io/microbadger/image-size/marmotjs/marmot-mysql.svg?style=flat-square&logo=dockbit
[docker-layers-image]: https://img.shields.io/microbadger/layers/marmotjs/marmot-mysql.svg?style=flat-square&logo=dockbit
[docker-url]: https://hub.docker.com/r/marmotjs/marmot-mysql/

## production

```bash
$ docker run --name marmot-mysql \
  -v $HOME/marmot_home/mysql_data:/var/lib/mysql \
  -d marmotjs/marmot-mysql
```

---

Just for developer

## build image

```bash
$ cd docker/marmot-mysql
$ docker build --pull -t marmotjs/marmot-mysql .
$ docker push marmotjs/marmot-mysql
```

## development

```bash
# start
$ docker run --rm --name marmot-mysql \
  -p 3306:3306 \
  -v $HOME/marmot_home/mysql_data:/var/lib/mysql \
  -d marmotjs/marmot-mysql

# stop
$ docker stop marmot-mysql
```
