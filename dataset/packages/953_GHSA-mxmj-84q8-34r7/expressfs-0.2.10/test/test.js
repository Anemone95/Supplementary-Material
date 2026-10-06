asyncTest('readFile', 2, function() {
  
  expressfs.readFile('test/hello.txt', function (data) {
    equal(data, 'world\n')
  })
  
  expressfs.readFile('test/hello2.txt', function (data) {
    equal(data, '')
    start()
  })
})

asyncTest('cp', 1, function() {
  
  expressfs.cp('test/hello.txt', 'test/hello.txt.copy', function (data) {
    
    expressfs.exists('test/hello.txt.copy', function (exists) {
      equal(true, exists)
      
      expressfs.unlink('test/hello.txt.copy', function () {
        start()
      })
      
    })
  
  })
  
})

asyncTest('createUntitled', 1, function() {
  
  expressfs.createUntitled('test/createUntitled', 'txt', '', function (filename) {
    ok(filename)
    start()
  })
  
})

asyncTest('createUntitledDir', 1, function() {
  
  expressfs.createUntitledDir('test/createUntitledDir/', function (filename) {
    ok(filename)
    start()
  })
  
})

asyncTest('exists', 2, function() {
  expressfs.exists('test/hello.txt', function (exists) {
    equal(true, exists)
  })

  expressfs.exists('test/hello2.txt', function (exists) {
    equal(false, exists)
    start()
  })
  
})

asyncTest('writeFile', 2, function() {
  var path = 'test/hello3.txt'
  expressfs.writeFile(path, 'mom', function () {
    
    expressfs.readFile(path, function (data) {
      equal(data, 'mom')
      
      
      expressfs.unlink(path, function () {
        
        expressfs.exists(path, function (exists) {
          equal(false, exists)
          start()
        })
        
      })
      
      
    })
    
  })
  
  
})

asyncTest('appendFile', 2, function() {
  var path = 'test/hello4.txt'
  expressfs.appendFile(path, '1', function () {

    expressfs.appendFile(path, '1', function () {    
      
      expressfs.readFile(path, function (data) {
        equal(data, '11')
        
        
        expressfs.unlink(path, function () {
          
          expressfs.exists(path, function (exists) {
            equal(false, exists)
            start()
          })
          
        })
        
        
      })
    })
  })
  
  
})

asyncTest('readdir', 1, function() {
  expressfs.readdir('test/readdirTest', function (dir) {
    equal(dir.length, 2)
    start()
  })

})

asyncTest('renameTest', 1, function() {
  expressfs.rename('test/renameTest/hi.txt', 'test/renameTest/newdir/hi2.txt', function () {
    expressfs.rename('test/renameTest/newdir/hi2.txt', 'test/renameTest/hi.txt', function () {
      expressfs.rmdir('test/renameTest/newdir', function () {
        ok(true)
        start()        
      })

    })
  })

})

asyncTest('downloadDirectory', 1, function() {
  expressfs.downloadDirectory('test/downloadTest/', null, function (data) {
    // returns a string encoded in space
    var expected = $('#downloadDir').text()
    equal(data, expected)
    start()
  })

})

asyncTest('downloadDirectory with extension', 1, function() {
  expressfs.downloadDirectory('test/downloadTestExtension', 'space', function (data) {
    // returns a string encoded in space
    var expected = $('#downloadDirExtension').text()
    equal(data, expected)
    start()
  })

})

asyncTest('dirStats', 2, function() {
  expressfs.dirStats('test/dirStats', function (data) {
    // returns a string encoded in space
    console.log(data)
    ok(data.match(/nested\n/))
    ok(data.match(/size 0\.1MB\n/))
    start()
  })

})




