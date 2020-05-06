'use strict'

process.title = 'Aperture server';

const webSocketsServerPort = 1337;
const webSocketServer = require('websocket').server;
const http = require('http');
const fs = require('fs');
const path = require('path');
const { getIPv4Address } = require('common/utils.js');

let httpServer;

function startServer(mainWindow) {
  httpServer = http.createServer(function (request, response) {
    const url = (request.url === '/') ? 'client/index.html' : request.url;
    const finalPath = path.join(__static, url)
    
    fs.readFile(finalPath, (err, data) => {
      if (!err) {
        const dotOffset = request.url.lastIndexOf('.');
        const mimeType = dotOffset == -1
          ? 'text/html'
          : {
            '.html': 'text/html',
            '.ico': 'image/x-icon',
            '.jpg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.css': 'text/css',
            '.ttf': 'font',
            '.js': 'text/javascript'
          }[request.url.substr(dotOffset)];
        response.setHeader('Content-type', mimeType);
        response.end(data);
      } else {
        console.error(err);
        response.writeHead(404, "Not Found");
        response.end();
      }
    });
  });

  const hostAddress = getIPv4Address();
  httpServer.listen(webSocketsServerPort, hostAddress, function (err) {
    console.log(`[${new Date()}] Server is listening on ${hostAddress}:${webSocketsServerPort}`);
    mainWindow.webContents.send('store-data', {
      set: 'server',
      address: hostAddress,
      port: webSocketsServerPort,
    })
  });

  const wsServer = new webSocketServer({ httpServer });

  wsServer.on('request', function (request) {
    let connection;
    console.log(`[${new Date()}] Connection from origin ${request.origin} accepted.`);
    connection = request.accept(null, request.origin);
    mainWindow.webContents.send('store-data', {
      set: 'client',
      address: request.remoteAddress
    });
    let luxValue = null;

    connection.on('message', function (message) {
      luxValue = message.utf8Data;
      mainWindow.webContents.send('store-data', {
        set: 'lux',
        value: luxValue
      });
    });

    connection.on('close', function (connection) {
      console.log(`[${new Date()}] Peer ${connection.remoteAddress} disconnected.`);
      mainWindow.webContents.send('store-data', {
        set: 'client',
        address: 'Не подключен'
      });
      mainWindow.webContents.send('store-data', {
        set: 'lux',
        value: 'Не подключен'
      });
    });
  });
}

function closeServer() {
  if (httpServer) {
    httpServer.close();
    console.log('Server was successfully closed')
  }
} 

module.exports = {
  startServer,
  closeServer,
}