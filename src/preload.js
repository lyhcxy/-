const { contextBridge, ipcRenderer } = require('electron')

// ȷ������������Ҫ�ķ���
contextBridge.exposeInMainWorld('electron', {
  minimize: () => ipcRenderer.send('minimize-window'),
  close: () => ipcRenderer.send('close-window'),
  ipcRenderer: {
    send: (channel, data) => {
      ipcRenderer.send(channel, data)
    },
    on: (channel, func) => {
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  }
}) 