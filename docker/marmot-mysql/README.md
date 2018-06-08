# marmot-mysql

- build image

```bash
cd docker/marmot-mysql
docker build -t marmotjs/marmot-mysql .
docker push marmotjs/marmot-mysql
```

- run mysql server

```bash
docker run --name marmot-mysql \
  -v $HOME/marmot_home/mysql_data:/var/lib/mysql \
  -d marmotjs/marmot-mysql
```

for development: expose port

```bash
docker run --name marmot-mysql \
  -p 3306:3306 \
  -v $HOME/marmot_home/mysql_data:/var/lib/mysql \
  -d marmotjs/marmot-mysql
```

- run server

```bash
npm run dev
```
