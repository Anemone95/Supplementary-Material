const http = require('http')
const fs = require('fs')
const url = require('url')
const path = require('path')
const opn = require('opn')
const mime = require('./mime')

module.exports = function (file, port) {
    const server = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url)
        let pathname = `.${parsedUrl.pathname}`
        fs.exists(pathname, exist => {
            if (!exist) {
                res.statusCode = 404
                return res.end(`File ${pathname} not found.`)
            }
            
            // if is a directory, then look for index.html
            if (fs.statSync(pathname).isDirectory()) {
                pathname += `/${file}`
            }
            
            // read file from file system
            fs.readFile(pathname, (err, data) => {
                if (err) {
                    res.statusCode = 500
                    res.end(`Error getting the file: ${err}.`)
                } else {
                    res.statusCode = 200
                    // based on the URL path, extract the file extention. e.g. .js, .doc, ...
                    const ext = path.parse(pathname).ext
                    // if the file is found, set Content-type and send data
                    res.setHeader('Content-type', mime[ext] || 'text/plain')
                    res.end(data)
                }
            })
        })
    })
    
    server.listen(port)
    
    server.on('listening', () => {
        console.log(`Server created!`)
        console.log(`open your browser and visit http://localhost:${port}`)
        opn(`http://localhost:${port}`)
    })
}
