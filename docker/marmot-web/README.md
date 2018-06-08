# marmot-web

- build image

```bash
cd ${PROJECT_ROOT_PATH}
docker build -t marmotjs/marmot-web .
docker push marmotjs/marmot-web
```

- run marmot-web

```bash
docker run --name marmot-web \
  -p 9900:9900 \
  --link marmot-mysql:mysql-host \
  -d marmotjs/marmot-web
```

for development:

```bash
npm run dev
```
