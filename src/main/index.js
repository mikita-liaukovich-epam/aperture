'use strict'
import { app, BrowserWindow } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
import { startServer, closeServer } from '@/server'

let mainWindow;
const isDevelopment = process.env.NODE_ENV !== 'production'

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      devTools: isDevelopment,
      nativeWindowOpen: true
    },
    icon: path.join(__static, 'images/favicon@256x256.png'),
  })

  if (isDevelopment) {
    mainWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadURL(formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    }));
    mainWindow.setMenu(null);
  }

  mainWindow.once('ready-to-show', () => {
    startServer(mainWindow);
    mainWindow.show();
  })
  
  mainWindow.on('closed', function () {
    mainWindow = null
    closeServer();
    process.exit(0);
  })

  mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
    if (frameName === 'Correction result') {
      event.preventDefault()

      Object.assign(options, {
        modal: true,
        parent: mainWindow,
        height: 480,
        width: 800,
        title: frameName
      })

      event.newGuest = new BrowserWindow(options);
      event.newGuest.setMenu(null);
      event.newGuest.webContents.openDevTools();
    }
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})