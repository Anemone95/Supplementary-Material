seeftl 
==============================

seeftl -- 一个简单的预览ftl文件的静态服务器（在anywhere基础上改的）

仅仅是通过在ftl同级目录写一个config文件，替换ftl里的变量和宏 达到实时预览的功能：

#### index.ftl
```
<html>
<body>
"${domain}" <br>
"${api}" <br>
<@common.test />

</body>
</html>
```

#### index.ftl.config
```
{
  "vars":{
    "domain":"m.suning.com",
    "api":"api.suning.com"
  },
  "macro": {
    "common.test":"test"
  }
}

```


## Installation
```
npm install seeftl -g
```

## Execution
```
$ seeftl
// or with port
$ seeftl -p 8000
// or start it but silent(don't open browser)
$ seeftl -s
// or with hostname
$ seeftl -h localhost -p 8888
// or with folder
$ seeftl -d ~/git/seeftl
```

## Help
```
$ seeftl --help
Usage:
  seeftl --help // print help information
  seeftl // 8000 as default port, current folder as root
  seeftl 8888 // 8888 as port
  seeftl -p 8989 // 8989 as port
  seeftl -s // don't open browser
  seeftl -h localhost // localhost as hostname
  seeftl -d /home // /home as root
```

## Visit

```
http://localhost:8000
```
执行命令后，默认浏览器将为您自动打开主页。



## License
The MIT license.
