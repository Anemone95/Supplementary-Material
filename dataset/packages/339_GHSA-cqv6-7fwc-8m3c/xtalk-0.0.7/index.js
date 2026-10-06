/*****************************************************************/
/* This is node.js only code. Do not remove or edit this header  */
eval(require('requireasync').install);
/* The above code loads appropriate code for this module         */
/*****************************************************************/


//console.log(require("eachkv")({installer:true}))
eval(require("eachkv")({debug:false}));

var lib = $R$({
    funcinfo:0,
    http:0,
    https:0,
    fs:0,
    url:0,
    path:0,
    'uglify-js':'minify',
    'js-beautify':{rename:{'js_beautify':'beautify'}},
    stringifyCode:0
});

lib.module_path = function (mod) {
    return (function (p, s) {
        return (p.splice(0, p.length - 1).join(s)) + s;
    })(mod.filename.split(lib.path.sep), lib.path.sep)
}
lib.module_name = function(mod) {
    return mod.filename.split(lib.path.sep).pop().split(".")[0];
}

lib.compress = function (orig_code) {
    return lib.minify(orig_code,{fromString:true}).code;
}

lib.pretty = function (orig_code) {
    return lib.beautify(orig_code, { indent_size: 2 });
}

var
    returnJCodePacket =
        module.exports.returnJCodePacket =
            function returnJCodePacket (args, src, ctype, etag, origin ,mtime) {
                const debug = false;
                var r = args.res;
                var d = new Date();
                var timenow = d.toUTCString();


                var headers = etag
                    ?  {
                    'content-type': ctype,
                    'cache-control': 'private',
                    //'date': mtime ? mtime : timenow,
                    'etag' : etag
                }  : {
                    'content-type': ctype,
                    'date':  mtime ? mtime : timenow
                }

                var remote_etag= args.req.headers['if-none-match'];
                var notModified =  (remote_etag && etag) && (remote_etag===etag);
                if (!notModified) {
                    if (mtime) {
                        var remote_mtime = args.req.headers['if-modified-since'];
                        if (remote_mtime) {
                            notModified = (remote_mtime===mtime);
                        }
                    }
                }



                if (notModified) {

                    r.writeHead(304, headers);
                    if(debug) console.log(args.req.headers);
                    r.write(src);
                    r.end();
                    return;


                }


                if (origin) {
                    headers['Access-Control-Allow-Origin'] = origin;
                }

                if (mtime) {
                    headers['last-modified']=mtime;
                }

                r.writeHead(200, headers);
                if(debug) console.log(args.req.headers);
                r.write(src);
                r.end();
            },

    returnJavascriptPacket =
        module.exports.returnJavascriptPacket =
            function returnJavascriptPacket (args, code,etag) {
                return returnJCodePacket(args,code,'application/javascript',etag);
            },
    returnJsonPacket =
        module.exports.returnJsonPacket =
            function returnJsonPacket (args, packet,etag) {
                return returnJCodePacket(args,lib.stringifyCode(packet),'application/javascript',etag);
            },
    returnJsonPacket_ =
        module.exports.returnJsonPacket_ =
            function returnJsonPacket_ (args, packet,etag) {
                const debug = false;
                var r = args.res;
                var d = new Date();
                var lastModified = d.toUTCString();
                var q=args.doc.query,pretty = q.pretty?2:0,

                    prelude=q.json_var ? "var "+q.json_var+"=" :(q.json_func?q.json_func+"(":""),

                    postlude=q.json_var ? ";" : (q.json_func? ");" : "" );

                var content = prelude+JSON.stringify(packet,null,pretty)+postlude;
                var contentLength = content.length;

                var headers = etag
                    ?  {
                    'content-type': 'application/json' ,
                    'cache-control': 'private',
                    'Access-Control-Allow-Origin' : args.req.headers.origin,
                    'date': lastModified,
                    'etag' : etag
                }
                    : {
                    'Access-Control-Allow-Origin' : args.req.headers.origin
                };

                r.writeHead(200, headers);
                if(debug) console.log(args.req.headers);
                r.write(content);
                r.end();
            };

var staticCaches = {};


var require_js_inline = function () {

    var md5src = lib.fs.readFileSync(lib.module_path(module)+'src/md5.js').toString("utf8");
    var CryptoJS = undefined;
    eval ("CryptoJS = (function(){"+md5src+";return CryptoJS;})();");
    lib.md5 = function(x){return CryptoJS.MD5(x).toString();};

    var window = {
        modules : {
            integrity : {version : ["394a908094fb75ea346e2c75c536a284","0000","REQUIRE.JS"]},
            md5:lib.md5
        }
    }, version = [];

    var integrityChecker = {
        version : version,
        check : function check (src) {
            var v = window.modules.integrity.version,
                x = parseInt(v[1]),
                n = v[0].length,
                n2 = v[1].length,
                z = x + n,
                vsrc=src.substr(x,n),
                vlen=src.substr(x+n+3,n2);
/*
            console.log("source is",src.length,"bytes");
            console.log("offset:",x);
            console.log("keylen:",n);
            console.log("offset len:",n2);
            console.log("src ver",vsrc);
            console.log("src offset",vlen);
            console.log("compare: ",vsrc,"v",v[0]);  */

            if (vsrc!=v[0]) return false;
         //   console.log("passed,compare: ",vlen,"v",x);
                if (vlen!=x) return false;
                b4=src.substr(0,x),
                aft=src.substr(z);
            var md5calc = window.modules.md5(b4+aft);

        //    console.log("passed,compare: ",md5calc,"v",v[0],md5calc===v[0]?"passed":"failed");
            return md5calc===v[0];
        }

}

    function integityEncode (src,filename){
        var lotsofzeros="00000000000000";
        var prefix = 'const version = ["',
            offset = src.indexOf(prefix);
        if (offset<0) {
            throw new error("can't locate prefix");
        }
        offset+=prefix.length;
        window.modules.integrity.version[2]=filename;
        var before = src.substr(0,offset),
            ver=window.modules.integrity.version[0],
            zeros=lotsofzeros.substr(0,window.modules.integrity.version[1].length);
        var strlen = zeros+""+offset;
            offset += ver.length;
        var delimit = src.substr(offset,3);
            offset += delimit.length;
            strlen = strlen.substr(strlen.length-zeros.length);
        offset += zeros.length;
        offset += delimit.length;
        offset += filename.length;
        var after= src.substr(offset),
            xxx = lib.md5(before+delimit+strlen+delimit+filename+after),
            result = before+xxx+delimit+strlen+delimit+filename+after;

        window.modules.integrity.version = [xxx,strlen,filename];

        if (!integrityChecker.check(result)) {
            throw new Error("could not create integrity check");
        }
        delete before;
        delete after;
        return result;
    }

    var template = function () {
        // File:    REQUIRE.JS
        const version = ["394a908094fb75ea346e2c75c536a284","0000","REQUIRE.JS"];
        var browser = true,
            node = false,
            REQUIRE_PATH = "",
            require = function require() {
            };

        window.module_downloads = {};
        window['module'] = {
            paths: ["./"],
            exports: {}};
        var wm={};
        window.modules=wm;

        var CryptoJS=CryptoJS={};

        window.modules.CryptoJS=CryptoJS;
        window.modules.md5 = function(x){return CryptoJS.MD5(x).toString();};
        window.modules.integrity={version:version,check:{}};
        window.modules.REQUIRE.local.getScriptSource(version[2],function(result){
            console.log("got src",result.length,"bytes");
            if (window.modules.integrity.check(result)) {
                console.log("source is intact");
                if (window.boot) {
                    if (!window.document.body.onload) {
                        console.log("document already loaded");
                        if (window.boot) window.boot();
                    } else {
                        console.log("window.boot deferred to document load.");
                        window.document.body.onload = window.boot;
                    }
                } else {
                    console.log("no window.boot found.");
                }
            } else {
                console.log("source is corrupted");
            }
        });

        var REQUIRE = window.modules.REQUIRE.exports.loadModule;
    }

    var intChecker = "version:version,check:"+lib.compress(integrityChecker.check.toString());

    var smaller, wmsrc = REQUIRE.JS;


    try {
        smaller = lib.compress(wmsrc);
        console.log("REQUIRE.JS squashed from " + (wmsrc.length) + " ---> " + (smaller.length) + " bytes (" + (wmsrc.length - smaller.length) + " bytes smaller, ie " + (((smaller.length / wmsrc.length) * 100)).toFixed(1) + "% of original size)");
    } catch (e) {
        console.log("could not minify REQUIRE.js, using original ("+wmsrc.length+" bytes)", e);
        delete smaller;
        smaller = wmsrc;
    }


    var req_big = integityEncode(lib.funcinfo.$renderFunctionSource$(
            template,
            {window_modules: "var wm=\\{\\}\\;",
                CryptoJS: "var CryptoJS=CryptoJS=\\{\\}\\;",
                integrity:"version\\:version,check:\\{\\}"
            },
            {
                window_modules: wmsrc,
                CryptoJS: md5src,
                integrity: intChecker
            },
            true),"REQUIRE.JS"),
        req_small = integityEncode(lib.funcinfo.$renderFunctionSource$(
            template,
            {window_modules:  "var wm=\\{\\}\\;",
                CryptoJS: "var CryptoJS=CryptoJS=\\{\\}\\;",
                integrity: "version\\:version,check:\\{\\}"
            },
            {window_modules: smaller,
                CryptoJS: md5src,
                integrity: intChecker
            },
            true),"REQUIRE.js");







    delete smaller;
    delete wmsrc;
    delete md5src;


    var md5Big =lib.md5(req_big);
    var md5Small =lib.md5(req_small);
    var mtime = new Date().toUTCString();


    staticCaches['/REQUIRE.JS'] = {
        handler: returnJavascriptPacket,
        content: req_big,
        mtime : mtime,
        etag:  md5Big
    };

    staticCaches['/REQUIRE.js'] = {
        handler: returnJavascriptPacket,
        content: req_small,
        mtime : mtime,
        etag: md5Small
    };

    console.log("/REQUIRE.JS md5 is",md5Big, "at",mtime,",",req_big.length,"bytes");
    console.log("/REQUIRE.js md5 is",md5Small, "at",mtime,",",req_small.length,"bytes");


}

require_js_inline();

var log = function (){} ;
//log = console.log;// uncomment this line to enable logging

var
    genericBrowserResponseProc =
        module.exports.genericBrowserResponseProc =
            function genericBrowserResponseProc (req,res,json) {
                var doc = lib.url.parse(req.url,true);
                console.log("sending json pkt",JSON.stringify(json));
                returnJsonPacket({
                        "req" : req,
                        "doc" : doc,
                        "res" : res,
                        "method" :req.method
                    },
                    json);
            };


var installedFunctions = {

    xtalk : {


    }
};

var  mandatory = module.exports.mandatory = 1;
var  optional = module.exports.optional = 0;
var  no_additional = module.exports.no_additional = 2;

var checkType = module.exports.checkType = function checkType(x,expect){
    if (typeof x==="undefined") return true;
    if (typeof x===expect) return true;
    if (expect==="date") return  (x instanceof Date) ;
    return true;
};


var recipientCheckArguments =
    module.exports.recipientCheckArguments =
        function recipientCheckArguments (args,template) {

            var no_extras = false;

            $eachKV$(
                template,
                function onNextTemplate(key,argx,breakout){
                    var check = typeof argx==="number" ? [argx] : argx;
                    if (args[key]===undefined) {
                        // not found

                        if (check[0]===mandatory) {
                            // mandatory
                            var error = new  Error("mandatory argument "+key+" not found in JSON");
                            console.log(error);

                        } else {
                            // optional - it's ok to be blank
                            // fill in any default if they supplied one
                            if (check[0] === no_additional) {
                                no_extras = true
                            } else {



                                if (check[0]===optional && check.length==3) {
                                    args[key] = check[2];
                                }
                            }
                        }
                    } else {

                        if (check.length > 1){
                            if (checkType(args[key],check[1])===false) {
                                error = new Error("Expecting argument "+key+" to be a "+check[1]+" but it is a "+typeof args[key]);
                                console.log(error);
                                throw error;
                            }

                        }

                    }
                },
                function afterLastTemplate(){

                }
            );

            if (no_extras) {
                $eachKV$(
                    args,
                    function onNextArg(key,current,breakout){
                        if (!template[key]) {
                            var error = new  Error("extra argument "+key+" found in JSON");
                            console.log(error);
                        }
                    },
                    function afterLastArg(){

                    }
                )
            }
            return args;
        };



// only difference is defaults are not filled in (or cleared) to save bandwidth.
var senderCheckArguments =
    module.exports.senderCheckArguments =
        function senderCheckArguments (args,template) {


            function getDefault(x,current){
                if (current!==undefined)
                    if (x!==current)  return current;

                return undefined;
            }

            var no_extras = false;


            $eachKV$(
                template,
                function onNextTemplate(key,argx,breakout){
                    var check = typeof argx==="number" ? [argx] : argx;
                    if (args[key]===undefined) {
                        // template key not found not found in

                        if (check[0]===mandatory) {
                            // mandatory
                            var error = new  Error("mandatory argument "+key+" not found in JSON");
                            console.log(error);

                        } else {
                            if (check[0] === no_additional) {
                                // remember to check for extra fields in the next loop
                                no_extras = true
                            } else {
                                // optional - it's ok to be blank, but we don't send it - server can fill it in.
                            }
                        }
                    } else {

                        if (check.length > 1){
                            if (checkType(args[key],check[1])===false) {
                                var error = new Error("Expecting argument "+key+" to be a "+check[1]+" but it is a "+typeof args[key]);
                                console.log(error);
                                throw error;
                            }
                        }

                    }
                },
                function afterLastTemplate(){

                }
            );


            var result = {};

            $eachKV$(
                args,
                function onNextArg(key,current,breakout){
                    var check = template[key];

                    if (no_extras) {
                        if (!check) {
                            var error = new  Error("extra argument "+key+" found in JSON");
                            console.log(error);
                        }
                    }

                    if ( typeof check==="object") {

                        if (check.length === 3) {
                            current = getDefault(check[2], current);
                            if (current === undefined)
                                return "continue";
                        }
                    }
                    result[key]=current;
                },
                function afterLastArg(){

                }
            );




            return result;
        };


var
    incomingRequestHandler =
        module.exports.incomingRequestHandler =
            function (req,res) {


            var body = '';
            req.on('data', function (data) {
                body += data;
                // Too much POST data, kill the connection!
                if (body.length > 1e6)
                    req.connection.destroy();
            });
            req.on('end', function () {
                var payload = JSON.parse(body);

                var responses = [];

                if (payload) {

                    $eachKVAsync$(
                        payload,
                        {
                            req:req,
                            res:res
                        },

                        function onModule(app_module, function_params,
                                          info,
                                          nextModule, exitModuleLoop) {

                           var loaded = installedFunctions.xtalk[app_module];
                            if (loaded) {
                                var moduleInfo = {
                                    module  : app_module,
                                    info    : info
                                };
                                $eachKVAsync$(
                                    function_params,
                                    moduleInfo,
                                    function onFunctDetails(
                                        func,label_args,
                                        moduleInfo,
                                        nextFunc,
                                        exitFuncLoop){

                                        function collectResponses (response,id) {
                                            var pkt = {
                                                module:moduleInfo.app_module,
                                                function:func,
                                                args:args,
                                                response:response
                                            };
                                            
                                            if (id) {
                                            	pkt.id=id;
                                            }
                                            
                                            responses.push(pkt);
                                        }

                                        var handler = loaded[func];
                                        if (handler) {

                                            var label = null,args;


                                            args = $eachKV$(
                                                label_args,
                                                function onNextItem(trylabel, arg, endLoop) {
                                                    label = trylabel;
                                                    endLoop(arg);
                                                }
                                            );


                                            if (handler(label,args,payload,collectResponses)===false) {
                                                exitFuncLoop(moduleInfo);
                                            } else {
                                                nextFunc(moduleInfo);
                                            }
                                        } else {
                                            collectResponses({error:"no handler"});
                                        }
                                    },
                                    function afterLastFunct(moduleInfo,aborted){
                                        if (aborted) {
                                            exitModuleLoop(moduleInfo.info);
                                        } else {
                                            nextModule(moduleInfo.info);
                                        }
                                    }
                                )
                            }

                        },
                        function afterLastModule(info, aborted) {

                               genericBrowserResponseProc(req,res,{
                                   responseCount:responses.length,
                                   responses:responses
                               })

                        }
                    );

                }

            });

        };

var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"};

var htmlroot = process.cwd();

var staticFileHandler = function staticFileHandler  (req, res) {
    var fs=lib.fs,path=lib.path,url=lib.url;
    var uri = url.parse(req.url).pathname;
    var filename = path.join(htmlroot, unescape(uri));
    var stats;


    try {
        stats = fs.lstatSync(filename); // throws if path doesn't exist
    } catch (e) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.write('404 Not Found\n');
        res.end();
        return;
    }


    if (stats.isFile()) {
        // path exists, is a file
        var mimeType = mimeTypes[path.extname(filename).split(".").reverse()[0]];
        res.writeHead(200, {'Content-Type': mimeType});

        var fileStream = fs.createReadStream(filename);
        fileStream.pipe(res);
    } else if (stats.isDirectory()) {
        // path exists, is a directory
        res.writeHead(200, {'Content-Type': 'text/plain','Access-Control-Allow-Origin' : req.headers.origin });
        res.write('Index of ' + uri + '\n');
        res.write('TODO, show index?\n');
        res.end();
    } else {
        // Symbolic link, other?
        // TODO: follow symlinks?  security?
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.write('500 Internal server error\n');
        res.end();
    }
};
var xTalkPrefixes = ["///xtalk/","/xtalk/"];
var requestHandler = function requestHandler (req, res) {
    var uri = lib.url.parse(req.url).pathname;
    if (req.method==="POST") {
        var handler = $eachKV$(xTalkPrefixes,function(k,prefix,handled){
            var check = uri.substr(0, prefix.length);
            if (check === prefix) {
                incomingRequestHandler(req, res);
                return handled(prefix);
            }
        });


    } else {

        var cache = staticCaches[uri];
        if (cache) {
            cache.handler({req:req,res:res},cache.content,cache.etag,null,cache.mtime);
        } else {
            return staticFileHandler(req, res);
        }
    }
};


var xTalkServer =
    module.exports.xTalkServer =
        lib.http.createServer(requestHandler).listen(1337);


var




    nextHandler = "(scope resolving for ___browserFollowupTemplate___)",



    templates = require(lib.module_path(module)+'src/templates.js')();



module.exports.install = function (MODULE,info){





    var sourcepath = lib.module_path(MODULE),
        modname    = lib.module_name(MODULE),
        funcname   = info.function || lib.funcinfo.$getFunctionName$(info.entry),
        sourcefile = MODULE.filename,

        url = (info.connect ? (info.connect.url ? info.connect.url : null): null) ||
            "/xtalk/" + modname+ "/" +funcname + "/",

        nodefile =  (info.connect ? (info.connect.nodefile ? info.connect.nodefile : null): null) ||
            sourcepath + modname + "_" + funcname+"_node.js",

        browserfile =  (info.connect ? (info.connect.browserfile ? info.connect.browserfile : null): null) ||
            sourcepath + modname + "_" + funcname+"_browser.js",

        setup_source = lib.funcinfo.$getFunctionInternalSource$(info.entry);


    var conversation = info.talk;
    var browser_followups = [], server_followups = [];
    var first_tag=undefined,first_response_source=undefined,first_server_source = undefined;
    var next_tag="";

    $eachKVAsyncReverse$(
        conversation,
        {},
        function(index, convo,info,next,exitLoop) {
            var id_tag = "id_" + index + "";

            var server_source = lib.funcinfo.$getFunctionInternalSource$(convo.node),
                response_source = lib.funcinfo.$getFunctionInternalSource$(convo.browser);

            if (first_tag === undefined) {
                next_tag = "";
            } else {
                next_tag = first_tag;
            }
            first_tag = id_tag;
            first_response_source = response_source;
            first_server_source = server_source;


            browser_followups.push(id_tag + " : " +
                lib.funcinfo.$renderFunctionSource$(
                    templates.___followupTemplate___,
                    templates.___functionTemplateKeys___,
                {
                    firstHandler:id_tag,
                    nextHandler: next_tag,
                    handlerCode: response_source
                }));

            server_followups.push(id_tag + " : " +
                lib.funcinfo.$renderFunctionSource$(
                    templates.___followupTemplate___,
                    templates.___functionTemplateKeys___,
                    {
                    firstHandler:id_tag,
                    nextHandler: next_tag,
                    handlerCode: server_source
                    }));
            next(info);
        },
        function(){

        }
    );


    browser_followups.pop();
    server_followups.pop();


    function encodePath(input) {
        return input.replace(new RegExp("\\\\",'g'),"\\\\");
    }

    if (browser_followups.length===0) next_tag="";

    browser_followups = browser_followups.length===0?"":","+ browser_followups.reverse().join(",");
    server_followups  = server_followups.length===0?"":","+server_followups.reverse().join(",");

    var browser_source =
        lib.funcinfo.$renderFunctionSource$(
            templates.___browserTemplate___,
            templates.___functionTemplateKeys___,
                {
                    modname      : modname,
                    funcname     : funcname,
                    url          : url,
                    sourcefile   : encodePath(sourcefile),
                    nodefile     : encodePath(nodefile),
                    browserfile  : encodePath(browserfile),
                    argschecker  : info['arguments'] ? JSON.stringify(info.arguments) : "undefined",
                    firstHandler : first_tag,
                    nextHandler  : next_tag  ,
                    setupCode    : setup_source,
                    handlerCode  : first_response_source,
                    followUpCode : browser_followups
                },
                true//,true
            );

     var ugly_browser=lib.compress(browser_source);

    var  node_source    =

        lib.funcinfo.$renderFunctionSource$(
            templates.___nodeTemplate___,
            templates.___functionTemplateKeys___,
            {
                modname      : modname,
                funcname     : funcname,
                url          : url,
                sourcefile   : encodePath(sourcefile),
                nodefile     : encodePath(nodefile),
                browserfile  : encodePath(browserfile),
                firstHandler : first_tag,
                argschecker  : info.arguments ? JSON.stringify(info.arguments) : "undefined",
                // nextHandler  : nextHandler,
                //setupCode    : setupCode,
                // serverCode   : serverCode,
                handlerCode  : first_server_source,
                followUpCode : server_followups,
                browserCode  : JSON.stringify(ugly_browser)
            },
            true
        );


    var pretty_node = lib.pretty(node_source);
    lib.fs.writeFile(nodefile,pretty_node,
        function(err){

            if (err) throw (err);
            lib.fs.writeFile(browserfile,lib.pretty(browser_source),
                function(err) {
                    if (err) throw (err);
                    try {

                        var funcHandler = require(nodefile);
                        var mod =  installedFunctions.xtalk[modname];
                        if (!mod) mod  = installedFunctions.xtalk[modname] = {}  ;
                        mod[funcname] = funcHandler;
                    }
                    catch (err) {

                        console.log(err);
                    }

                });

        });




};

