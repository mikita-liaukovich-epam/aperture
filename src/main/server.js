'use strict'

process.title = 'Aperture server';

const webSocketsServerPort = 1337;
import { server as webSocketServer } from 'websocket';
import { createServer } from 'https';
import { readFileSync, readFile } from 'fs';
import { join } from 'path';
import { getIPv4Address } from 'common/utils.js';

let httpsServer;

const serverOptions = {
  key: readFileSync(join(__static, 'server/key.pem')),
  cert: readFileSync(join(__static, 'server/cert.pem'))
};

function startServer(mainWindow) {
  httpsServer = createServer(serverOptions, function (request, response) {
    const url = (request.url === '/') ? 'client/index.html' : request.url;
    const finalPath = join(__static, url)
    
    readFile(finalPath, (err, data) => {
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
  httpsServer.listen(webSocketsServerPort, hostAddress, function (err) {
    console.log(`[${new Date()}] Server is listening on ${hostAddress}:${webSocketsServerPort}`);
    mainWindow.webContents.send('store-data', {
      set: 'server',
      address: 'https://' + hostAddress,
      port: webSocketsServerPort,
    })
  });

  const wsServer = new webSocketServer({ httpServer: httpsServer });

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
  if (httpsServer) {
    httpsServer.close();
    console.log('Server was successfully closed')
  }
} 

export {
  startServer,
  closeServer,
}