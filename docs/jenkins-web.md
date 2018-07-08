# Jenkins Web Task

---

## Build With Docker

We provide the webpack build docker like `macacajs/macaca-electron-docker`, so you can set the feild content like this:

```
docker stop $JOB_NAME || true && docker rm $JOB_NAME || true

docker run --rm \
  --name $JOB_NAME \
  -e JOB_NAME \
  -e BUILD_NUMBER \
  -v $HOME/marmot_home/static:/static \
  -v $WORKSPACE:/root/src macacajs/macaca-electron-docker
```

## Sample

- [web-app-bootstrap](//github.com/app-bootstrap/web-app-bootstrap)
- [H5 Sample](//github.com/app-bootstrap/awesome-practice-projects)
