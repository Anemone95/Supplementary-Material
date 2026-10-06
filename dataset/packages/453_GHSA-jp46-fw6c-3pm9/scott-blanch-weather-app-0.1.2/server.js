var fs= require('fs');
var http = require('http');
var url = require('url');
var dataFilePath = 'cities.dat.txt';
var ROOT_DIR = 'html/';
var indexFileName = 'index.html';
var port = (process.env.PORT || 5000);

function handleGetCity(urlObj, req, res){



  fs.readFile(dataFilePath, function(err,data){
    if(err){
      res.writeHead(500);
      res.end('error with retrieving data');
    }

    var myRe = new RegExp('^'+urlObj.query['q'].toLowerCase());
    var cities = data.toString().split('\n');

    var returnArray = cities.
      filter(function(city){
        return city.toLowerCase().search(myRe) != -1;
      }).
      map(function(city){
        return {
          city: city
        };
      });


    res.writeHead(200);
    res.end(JSON.stringify(returnArray));


  });

  // fs.readFile(dataFilePath, function(err, data){
  //   if (err){
  //     res.writeHead(500);
  //     res.end('error with retrieving data');
  //   }





  //   res.writeHead(200);
  //   res.end([]);


  // });
}

function handleStaticFile(urlObj, req, res){

  var pathName = urlObj.pathname;

  if(!pathName || pathName == '/'){
    pathName = indexFileName;
  }

  fs.readFile(ROOT_DIR + pathName, function(err, data){
    if(err){
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
}

function useCorrectHandler( urlObj, req, res ){
  if( urlObj.pathname.indexOf('getcity') != -1){
    handleGetCity(urlObj, req, res);
  }
  else{
    handleStaticFile(urlObj, req, res);
  }
}


http.createServer(function(req, res){
  var urlObj = url.parse(req.url, true, false);
  useCorrectHandler(urlObj, req, res);
  
}).listen(port, function(){
  console.log('Listening on port ' + port);
});

