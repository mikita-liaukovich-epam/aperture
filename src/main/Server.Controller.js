'use strict'

process.title = 'Mikita Liaukovich diploma';

const webSocketsServerPort = 1337;
const webSocketServer = require('websocket').server;
const http = require('http');
const fs = require('fs');
const { getIPv4Address } = require('common/utils.js');

let httpServer;
const startServer = function (mainWindow) {
  httpServer = http.createServer(function (request, response) {
    let url = (request.url === '/') ? '/static/client/client.index.html' : request.url;
    fs.readFile('./dist' + url, function (err, data) {
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
    console.log(`[${new Date()}] Server is listening on port ${webSocketsServerPort}`);
    mainWindow.webContents.send('store-data', {
      set: 'server',
      address: hostAddress,
      port: webSocketsServerPort,
    })
  });

  const wsServer = new webSocketServer({ httpServer });

  wsServer.on('request', function (request) {
    let connection;
    console.log(`[${new Date()}] Connection from origin ${request.origin}.`);
    connection = request.accept(null, request.origin);
    mainWindow.webContents.send('store-data', {
      set: 'client',
      address: request.remoteAddress
    });
    let luxValue = null;
    console.log(`[${new Date()}] Connection accepted.`);

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

module.exports = {
  startServer,
}