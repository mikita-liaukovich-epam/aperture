'use strict'
import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import { startServer } from '@/server'

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: true,
    webPreferences: {
      nodeIntegration: true,
      preload: 'server.js',
      // webSecurity: false,
      //devTools: false,
    },
    icon: path.join(__static, 'images/favicon.png'),
  })
  
  mainWindow.loadFile(path.join(__static, 'server/index.html'));
  //mainWindow.setMenu(null)

  mainWindow.once('ready-to-show', () => {
    mainWindow.webContents.send('ready');
    startServer(mainWindow);
    mainWindow.show()
  })

  ipcMain.once('shit', function (err, data) {
    console.log(data);
  })

  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})