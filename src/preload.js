const { contextBridge, ipcRenderer } = require('electron');

// 使用 contextBridge 安全地暴露 IPC 功能
contextBridge.exposeInMainWorld('electronAPI', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, callback) => ipcRenderer.on(channel, callback)
});
