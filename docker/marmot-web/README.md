## marmot-web

### build image

```bash
cd ${PROJECT_ROOT_PATH}
docker build -t marmotjs/marmot-web .
docker push marmotjs/marmot-web
```

### production

```bash
docker run --name marmot-web \
  -p 9900:9900 \
  -e MARMOT_HOST='your.hostname.com' \
  --link marmot-mysql:mysql-host \
  -d marmotjs/marmot-web
```

- `open http://your.hostname.com:9900`

### development

```bash
npm run dev
```
