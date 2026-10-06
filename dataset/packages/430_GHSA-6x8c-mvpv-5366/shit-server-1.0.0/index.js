#! /usr/bin/env node
const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const commander = require('commander');
const app = express();


commander
    .version('1.0.0')
    .usage('[options] [dir]')
    .option('-i, --auto-index', 'Automatically searches for index.html in directory')
    .parse(process.argv);

let dir = process.cwd();

if (commander.args.length) {
    dir = commander.args[0];
}

const autoIndex = commander.autoIndex || false;

function showDirOrErr(filePath, res) {
    res.set('Content-Type', 'text/html');

    fs.stat(filePath, (err, stats) => {
        if (!err && stats.isDirectory()) {
            fs.readdir(filePath, (err, files) => {
                if (err) {
                    res.status(500);
                    res.send(`
                        <html>
                            <head>
                            </head>
                            <body>
                            I'm going to be completely honest with you here.
                            Something went wrong, I don't exactly know what, but... it's probably your fault.
                            </body>
                        </html>
                        `);
                } else {
                    res.send(`
                        <html>
                            <head>
                            </head>
                            <body>
                                This is a directory... and here's what's in it...
                                <ul>
                                    ${files.map((f) => `<li><a href="${f}">${f}</a></li>`).join('\n')}
                                </ul>
                            </body>
                        </html>
                        `)
                }

            });
        } else {
            res.status(404);
            res.send(`
                <html>
                    <head>
                    </head>
                    <body>
                    Could not find: ${path.resolve(filePath)}
                    </body>

                </html>
            `);
        }
    });

}

function processFile(filePath, req, res) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (autoIndex && path.extname(filePath) === '') {
                fs.stat(path.join(filePath, 'index.html'), (err, stats) => {
                    if (!err && stats.isFile()) {
                        processFile(path.join(filePath, 'index.html'), req, res);
                    } else {
                        showDirOrErr(filePath, res);
                    }
                });

            } else {
                showDirOrErr(filePath, res);
            }
        } else {
            switch(path.extname(filePath)) {
            case '.html':
                res.set('Content-Type', 'text/html');
                break;
            case '.css':
                res.set('Content-Type', 'text/css');
                break;
            case '.js':
                res.set('Content-Type', 'text/javascript');
                break;
            case '.json':
                res.set('Content-Type', 'application/json');
                break;
            default:
                // res.set('Content-Type', 'text/plain');
            }
            res.send(data);
        }
    });
}

app.use('/', (req, res) => {
    const fullPath = path.join(dir, req.path);

    processFile(fullPath, req, res);
});

const server = http.createServer(app);

server.once('listening', () => {
    console.log(`Connected on ${server.port}`)
});

function findPort(port) {
    server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            return findPort(port + 1);
        } else {
            throw err;
        }
    });

    server.port = port;
    server.listen(port);

}


findPort(8080);



