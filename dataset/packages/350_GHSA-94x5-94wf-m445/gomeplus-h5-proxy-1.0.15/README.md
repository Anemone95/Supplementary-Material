[gomeplus-h5-proxy](https://github.com/gomeplusFED/meixin-h5-proxy.git) — 美信H5 CDN代理模块
==================================================

简介
----

此模块通过nodejs安装后可以直接进行CDN资源代理，便于调试。

使用指南
----
与gulp一样，支持全局命令proxy<br>

```
npm install gomeplus-h5-proxy -g
```

```
npm install gomeplus-h5-proxy --save-dev
```

然后可以直接通过如下命令进行代理

全局安装使用

```
proxy -d "/Users/zhangmike/WebstormProjects/gomeplus/branches/h5Refactor/src" -p "/m/h5/src,src" -f "/Users/zhangmike/WebstormProjects/gomeplus/public/gomeplusJS/dist/" -o 8011
```

本地安装使用

```
node ./command.js -d "/Users/zhangmike/WebstormProjects/gomeplus/h5/dist" -p "/m/h5/dist" -f "/Users/zhangmike/WebstormProjects/gomeplus/public/dist/js/"
```

```
node ./command.js -d "/Users/zhangmike/WebstormProjects/gomeplus/branches/h5Refactor/src" -p "/m/h5/src,src" -f "/Users/zhangmike/WebstormProjects/gomeplus/public/gomeplusJS/dist/" -o 8011
```

```
MAC && LINUX    
proxy -r '{"/Users/zhangmike/WebstormProjects/gomeplus/h5/dist":["/m/h5/dist"],"/Users/zhangmike/WebstormProjects/gomeplus/public/gomeplusJS/dist/":["/m/public/gomeplusJS/dist/"]}' -f "/Users/zhangmike/WebstormProjects/gomeplus/public/gomeplusJS/dist/"  
```



```
WINDOWS    
proxy -r {\"D:/workspace/h5/dist\":[\"/m/h5/dist\"],\"D:/workspace/public/gomeplusJS/dist/\":[\"/m/public/gomeplusJS/dist/\"]} -f "D:/workspace/public/gomeplusJS/dist/"
```
可以通过
```
proxy -h
```
查看帮助
-d代表想要代理的文件目录，-p代表CDN链接中间那部分  
-r代表目录map对象,key是本地路径,value是数组,需要替换的路径  
-f代表combo的public路径


最后需要配置一下hosts，
---
127.0.0.1  js-pre.meixincdn.com