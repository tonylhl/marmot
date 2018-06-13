# Documents

---

## Docker Deploy

### Using [docker-compose](https://docs.docker.com/compose/) (recommended)


## production

```
# start services
$ docker-compose -p marmot -f docker-compose.yml up -d

# stop services
$ docker-compose -p marmot -f docker-compose.yml down
```

## development

```
# start services
$ docker-compose up

# stop services
$ docker-compose down
```

marmot server is running on [http://127.0.0.1](http://127.0.0.1) by default.

should edit [docker-compose.yml](docker-compose.yml) on demand.

### Using [docker](https://docs.docker.com/)

- [marmot-web](../docker/marmot-web/README.md)
- [marmot-mysql](../docker/marmot-mysql/README.md)
- [marmot-nginx](../docker/marmot-nginx/README.md)
