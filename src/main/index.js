'use strict'
import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
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
      // devTools: false,
    },
    icon: path.join(__static, 'images/favicon.png'),
  })

  if (isDevelopment) {
    mainWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadURL(formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    }))
  }
  mainWindow.setMenu(null)

  mainWindow.once('ready-to-show', () => {
    startServer(mainWindow)
    mainWindow.show()
  })

  mainWindow.on('closed', function () {
    mainWindow = null
    closeServer();
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})