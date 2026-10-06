exports["localhost"] = {
	path : "D:\\node-server-forfront\\",
    port : 2850,
    agent : ""
};
exports["story1"] = {
	path : 'D:\\project\\recycle_terrace\\',
    port : 8080,
    agent : {
        get:function(path) {
            return{
                host:'xuan.news.cn',
                path:path.replace('test','news')
            }
        }
    }
};
exports["main"] = {
	path : "D:\\project\\main\\",
    port : 8090,
    agent : {
        get:function(path) {
            return{
                host:'xuan.news.cn',
                port:80,
                path:path.replace('test','news')
            }
        }
    }
};
exports["news"] = {
	path : "D:\\project\\news\\",
    port : 3000,
    agent : {
        get:function(path) {
            return{
                host:'xuan.news.cn',
                port:80,
                path:path.replace('test','news')
            }
        }
    }
};
exports["story"] = {
	path : "D:\\project\\mobile_story\\",
    port : 8000,
    agent : {
        get:function(path) {
            return{
                host:'xuan.news.cn',
                port:80,
                path:path.replace('test','news')
            }
        }
    }
};