'use strict'

import { app, protocol, BrowserWindow, session } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
const { ipcMain } = require('electron')
const path = require('path')

const isDevelopment = process.env.NODE_ENV !== 'production'

// 保持窗口对象的全局引用
let win

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // 添加跨域配置
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['Origin'] = 'https://www.mastercard.com.cn'
    details.requestHeaders['Referer'] = 'https://www.mastercard.com.cn/zh-cn/personal/get-support/convert-currency.html'
    callback({ cancel: false, requestHeaders: details.requestHeaders })
  })

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Access-Control-Allow-Origin': ['*'],
        'Access-Control-Allow-Headers': ['*']
      }
    })
  })

  // Create the browser window.
  win = new BrowserWindow({
    width: 1000,
    height: 620,
    title: '汇率计算器',
    resizable: false,
    maximizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js'),
      enableRemoteModule: true
    },
    frame: false,
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    useContentSize: true
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

// 在适当的位置添加 IPC 通信
ipcMain.on('window-min', () => {
  win.minimize()
})

ipcMain.on('window-max', () => {
  if (win.isMaximized()) {
    win.restore()
  } else {
    win.maximize()
  }
})

ipcMain.on('window-close', () => {
  win.close()
})
