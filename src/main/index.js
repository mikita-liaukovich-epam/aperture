'use strict'

import { app, BrowserWindow } from 'electron'
import * as path from 'path'
import { startServer } from './Server.Controller.js';

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      // webSecurity: false,
      //devTools: false,
    },
    icon: path.join(__static, 'images/favicon.png'),
  })

  mainWindow.loadFile('common/server/index.html');
  //mainWindow.setMenu(null)

  mainWindow.once('ready-to-show', () => {
    startServer(mainWindow);
    mainWindow.show()
  })

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})
