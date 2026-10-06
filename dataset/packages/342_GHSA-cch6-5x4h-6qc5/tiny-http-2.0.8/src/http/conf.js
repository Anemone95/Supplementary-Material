var Conf = function() {
    var conf = {
        LIST_DIR: true,//是否显示目录
        CACHE: 'no-cache',
        DEFAULT_INDEX: ['index.html', 'index.htm', 'index.asp', 'index.php', 'index.json', 'index.txt', 'index.njs'],//默认首页索引
        EXTEND_EXT: '.njs',//扩展后缀
        MAX_QUEUE_LENGTH: 20,

        /*允许用于并发处理CGI的最大进程数,为了避免主进程阻塞，CGI使用子进程处理，CGI会进入一个等待队列，等待执行，进程越多，并发处理能力越强，但系统资源占用越多*/

        //以下设置无需配置
        WEB_ROOT: null,
        PORT: null,
        IP: null,
        WORKING_DIR: __dirname,
        process: {length :0},
        
    };
    return conf;
};
