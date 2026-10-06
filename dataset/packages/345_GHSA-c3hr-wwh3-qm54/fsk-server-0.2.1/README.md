##### fsk-server #####

* fsk-server

##### 如何安装 #####

npm install fsk-server -g

* 简单的http服务
* 解决页面加载资源缓存的问题 默认端口 3001
* cd /Library/WebServer/pics/fe/dev/c/h5/pagaes
* 执行 fsk-server
* 访问http://127.0.0.1:3001/demo.shtml
* 通过页面访问的所有资源会被添加 sid=123123*** 时间戳

###### 需要使用80端口访问页面的同学可以看一下方法 ######

修改 hosts 增加域名配置到本地，如: 127.0.0.1  pages.h5.com

修改 nginx 配置

    upstream h5.com {
        server  127.0.0.1:3001;
    }

    server {
        listen       80;
        server_name  pages.h5.com;
        location / {
            proxy_pass         http://h5.com;
            proxy_set_header   Host             $host;
            proxy_set_header   X-Real-IP        $remote_addr;
            proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
            proxy_set_header   Host $host;
            proxy_http_version 1.1;
        }
    }
* cd /Library/WebServer/pics/fe/dev/c/h5/pagaes
* 执行 fsk-server
* 访问 pages.h5.com/demo.shtml
