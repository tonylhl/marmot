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
