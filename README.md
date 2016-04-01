# 3a-classic-ui

## DEPENDENCY

* [3a-classic-server](http://git.sadayuki-matsuno.com/3aclassic/3a-classic-server)
* mongo

## REQUIRED CONFIGURE

* change 3a-classic-server host info

```javascript
$ vim 3a-clasic-ui/js/config.js

var config = {
  apiHost: 'YOUR_3A_CLASSIC_SERVER_HOST', 
}
```

if you change port of 3a-classic-server, write this

```javascript
$ vim 3a-clasic-ui/js/config.js

var config = {
  apiHost: 'YOUR_3A_CLASSIC_SERVER_HOST:PORT', 
}
```


## USAGE

* change directry to your work dir

```bash
$ cd /path/to/work/dir
```

* download this repositry

```bash
$ git clone http://git.sadayuki-matsuno.com/3aclassic/3a-classic-ui.git
```

* run docker

```bash
$ docker run --name 3a-classic-ui -p 8080:80  -v /path/to/work/dir/3a-classic-ui:/usr/share/nginx/html:ro -d nginx
```

* access

```
http://localhost:8080
```