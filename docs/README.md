# Documents

---

## Docker Deploy

### Using [docker-compose](https://docs.docker.com/compose/) (recommended)

```
# start services
$ docker-compose -p marmot -f docker/compose/docker-compose.yml up -d

# stop services
$ docker-compose -p marmot -f docker/compose/docker-compose.yml down
```

marmot server is running on [http://127.0.0.1](http://127.0.0.1) by default.

should edit [docker-compose.yml](../docker/compose/docker-compose.yml) on demand.

### Using [docker](https://docs.docker.com/)

- [marmot-web](../docker/marmot-web/README.md)
- [marmot-mysql](../docker/marmot-mysql/README.md)
- [marmot-nginx](../docker/marmot-nginx/README.md)
