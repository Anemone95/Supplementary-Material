var fs = require("fs"),
   _ = require("underscore");
module.exports = {
  execute: function(str,root,req, resp){
      var belong = "$[placeholder]";
      var h = /\$belong\[["\s]*([^"\s]+)["\s]*\]/.exec(str); 
      try{
          if(h){  //如果有belong关键字, 先处理: 所有路径关键字均使用从root起的绝对路径。
              belong = fs.readFileSync( root + "/" + h[1],'utf-8');   //读取belong文本
              str = str.replace(h[0], "" );           //替换关键字
              str = belong.replace("$[placeholder]",str);
          }
          
          var result = str;
          var compiled = _.template( str.replace(/\$include\[["\s]*([^"\s]+)["\s]*\]/g, function(match, key){
              return fs.readFileSync( root + "/" + key,'utf-8');   //读取include文本
            })
          );
          result = compiled({require: require, request:req.$, response:resp});
         
          switch(typeof result){
            case "function": result(); return;
            case "string":
            default :
                resp.end( result );
              
          }





      }catch(e){
          console.error(e);
          return str;
      }
  }
};