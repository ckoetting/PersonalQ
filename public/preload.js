const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    'api', {
        saveReport: (reportData) => ipcRenderer.invoke('save-report', reportData),
        getApiKeys: () => ipcRenderer.invoke('get-api-keys'),
        saveApiKeys: (keys) => ipcRenderer.invoke('save-api-keys', keys),
        ezekiaRequest: (requestOptions) => ipcRenderer.invoke('ezekia-request', requestOptions)
    }
);