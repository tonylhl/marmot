# Integrate With Jenkins

---

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


