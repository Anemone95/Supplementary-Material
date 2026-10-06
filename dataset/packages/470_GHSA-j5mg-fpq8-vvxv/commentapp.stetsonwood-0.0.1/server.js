var fs = require('fs');
var http = require('http');
var url = require('url');
var readLine = require('readline');
var ROOT_DIR = "html/";
http.createServer(function (req, res) {
  var urlObj = url.parse(req.url, true, false);
  //console.log(urlObj);
  if(urlObj.pathname.indexOf("getcity") > -1) {
    
    console.log('getcity: ' + urlObj.query.city);
    var regex = new RegExp("^" + urlObj.query.city);
    var jsonResponse = [];

    fs.readFile('utahCities.dat.txt', function (err, data) {
      
      if(err) throw err;
      var cities = data.toString().split("\n");
      
      for(var i = 0; i < cities.length; i++) {
        
        var result = cities[i].search(regex);

        if(result != -1) {

          jsonResponse.push({city:cities[i]});

        }

      }

      res.writeHead(200);
      res.end(JSON.stringify(jsonResponse));

    });    
  } else if(urlObj.pathname.indexOf("comment") > -1) {
    
    console.log("comment route");
    
    if(req.method === "POST") {
      
      console.log("In POST");
      var jsonData = "";
      req.on('data', function (chunk) {
        jsonData += chunk;
      });
      req.on('end', function () {
        var reqObj = JSON.parse(jsonData);
        console.log(reqObj);
        console.log("Name: "+reqObj.Name);
        console.log("Comment: "+reqObj.Comment);
        
        var MongoClient = require('mongodb').MongoClient;
        MongoClient.connect("mongodb://localhost/weather", function(err, db) {
          if(err) throw err;
          db.collection('comments').insert(reqObj, function(err, records) {
            console.log("Record added as " + records[0]._id);
          });
        });

      });

      res.writeHead(200);
      res.end("");

    } else if(req.method === "GET") {
      console.log("In GET"); 
      var MongoClient = require('mongodb').MongoClient;
      MongoClient.connect("mongodb://localhost/weather", function(err, db) {
        if(err) throw err;
        db.collection("comments", function(err, comments){
          if(err) throw err;
          comments.find(function(err, items){
            items.toArray(function(err, itemArr) {
              console.log("Document Array: ");
              console.log(itemArr);
              res.writeHead(200);
              res.end(JSON.stringify(itemArr));
            });
          });
        });
      });
    }
  } else {
    fs.readFile(ROOT_DIR + urlObj.pathname, function (err,data) {
      if (err) {
        
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;

      } else {
        
        res.writeHead(200);
        res.end(data);

      }
    }); 
  }
}).listen(80);