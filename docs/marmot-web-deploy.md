# Marmot Web Deploy

---

## Docker Deploy

### Using [docker-compose](https://docs.docker.com/compose/) (recommended)

## production

```
# start services
$ docker-compose -p marmot -f docker-compose.yml up -d

# NOTE: if you meet the problem, maybe the issue caused by the existed service, just run the stop command below.

# stop services
$ docker-compose -p marmot -f docker-compose.yml down
```

execute `docker ps`, we can see:

```
CONTAINER ID        IMAGE                     COMMAND                  CREATED             STATUS                      PORTS                                            NAMES
8b2941c9774a        marmotjs/marmot-web       "./entrypoint.sh npm…"   12 minutes ago      Up 12 minutes (healthy)     0.0.0.0:9900->9900/tcp                           marmot_web_1
2573f3d5e19a        macacajs/macaca-datahub   "/entrypoint.sh"         12 minutes ago      Up 12 minutes (unhealthy)   0.0.0.0:9300->9300/tcp, 0.0.0.0:9930->9200/tcp   marmot_datahub_1
b726a3232cdc        marmotjs/marmot-mysql     "docker-entrypoint.s…"   12 minutes ago      Up 12 minutes               3306/tcp                                         marmot_mysql_1
ffb2ab9f12fb        marmotjs/marmot-nginx     "nginx -g 'daemon of…"   12 minutes ago      Up 12 minutes               0.0.0.0:9920->80/tcp                             marmot_nginx_1
```

go into the MySQL

```bash
$ docker exec -it marmot_mysql_1 mysql -uroot -pmarmot
mysql> use marmot;
mysql> show tables;
mysql> select * from marmot.jobNames;
```

## development

```
# start services
$ docker-compose up

# stop services
$ docker-compose down
```

Marmot server is running on `http://127.0.0.1:9900` by default.

Nginx server is running on `http://127.0.0.1:9920` by default.

should edit [docker-compose.yml](../docker-compose.yml) on demand.

### Using [docker](https://docs.docker.com/)

- [marmot-web](../docker/marmot-web/README.md)
- [marmot-mysql](../docker/marmot-mysql/README.md)
- [marmot-nginx](../docker/marmot-nginx/README.md)
