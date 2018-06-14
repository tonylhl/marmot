# Integrate With Jenkins

---

> Deployment and Installation

## Marmot home path

```bash
$ mkdir $HOME/marmot_home
```

marmot_home requires the following sub-directories to be created.

```
.
├── static                               Static HTTP server root folder, containing build artifacts, reports, and archived files.
├── mysql_data                           Mysql Database. Can be backed up easily.
├── jenkins_home                         Jenkins root folder, containing configuration files and plugins.
├── jenkins_tmp                          Jenkins temporary folder.
├── jenkins.war                          Jenkins war package. Can execute programs.
└── macaca-datahub                       Macaca DataHub central service archives
```

## Marmot Jenkins Deployment

- In `$HOME/marmot_home` directory, create jenkins_home, jenkins_tmp
- Download official [War package](http://mirrors.jenkins.io/) to $HOME/marmot_home directory
- jenkins service launches at port 9910

```bash
$ java -Dfile.encoding=UTF-8 \
  -XX:PermSize=256m \
  -XX:MaxPermSize=512m \
  -Xms256m \
  -Xmx512m \
  -DJENKINS_HOME=$HOME/marmot_home/jenkins_home \
  -Djava.io.tmpdir=$HOME/marmot_home/jenkins_tmp \
  -jar $HOME/marmot_home/jenkins.war \
  --httpPort=9910
```

Change `$HOME/marmot_home/jenkins_home/config.xml` useSecurity to false, and restart the Jenkins.

---

## Build Scripts

### For Android

We provide the Android build docker like `macacajs/macaca-android-build-docker`, so you can set the feild content like this:

```bash
docker stop $JOB_NAME || true && docker rm $JOB_NAME || true

docker run --rm \
  --name $JOB_NAME \
  -e JOB_NAME \
  -e BUILD_NUMBER \
  -e GIT_BRANCH \
  -e GIT_URL \
  -v $HOME/marmot_home/static:/static \
  -v $HOME/marmot_home/gradle_cache:/root/.gradle \
  -d macacajs/macaca-android-build-docker
```

[Android Sample](//github.com/app-bootstrap/android-app-bootstrap)

### For Front End

We provide the webpack build docker like `macacajs/macaca-electron-docker`, so you can set the feild content like this:

```
docker stop $JOB_NAME || true && docker rm $JOB_NAME || true

docker run --rm \
  --name $JOB_NAME \
  -e JOB_NAME \
  -e BUILD_NUMBER \
  -e GIT_BRANCH \
  -e GIT_URL \
  -v $HOME/marmot_home/static:/static \
  -v $WORKSPACE:/root/src macacajs/macaca-electron-docker
```

[H5 Sample](//github.com/app-bootstrap/awesome-practice-projects)

### For iOS

```bash
MARMOT_SERVER_URL=http://{MARMOT_HOST}:9900 ./ci.sh
```

[iOS Sample](//github.com/app-bootstrap/ios-app-bootstrap)
