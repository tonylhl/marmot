# marmot-nginx

- build image

```bash
cd docker/marmot-nginx
docker build -t marmotjs/marmot-nginx .
docker push marmotjs/marmot-nginx
```

- run nginx server

```bash
docker run --name marmot-nginx \
  -p 9920:80 \
  -v $HOME/marmot_home/static:/usr/share/nginx/html:ro \
  -d marmotjs/marmot-nginx
```
