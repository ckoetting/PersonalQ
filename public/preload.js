const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script executing...');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    'api', {
        saveReport: (reportData) => {
            console.log('Calling saveReport from preload');
            return ipcRenderer.invoke('save-report', reportData);
        },
        getApiKeys: () => {
            console.log('Calling getApiKeys from preload');
            return ipcRenderer.invoke('get-api-keys');
        },
        saveApiKeys: (keys) => {
            console.log('Calling saveApiKeys from preload with:', {
                ezekiaApiKey: keys.ezekiaApiKey ? 'Provided' : 'Not provided',
                openaiApiKey: keys.openaiApiKey ? 'Provided' : 'Not provided'
            });
            return ipcRenderer.invoke('save-api-keys', keys);
        },
        ezekiaRequest: (requestOptions) => {
            console.log('Calling ezekiaRequest from preload');
            return ipcRenderer.invoke('ezekia-request', requestOptions);
        },
        testEnvAccess: () => {
            console.log('Calling testEnvAccess from preload');
            return ipcRenderer.invoke('test-env-access');
        }
    }
);

// Log when preload script has completed
console.log('Preload script completed, API methods exposed to renderer');

// Add listeners for IPC events to debug communication
ipcRenderer.on('error', (event, error) => {
    console.error('IPC error event received:', error);
});

// Monitor IPC call responses
const originalInvoke = ipcRenderer.invoke;
ipcRenderer.invoke = function(channel, ...args) {
    console.log(`IPC invoke: ${channel}`);

    return originalInvoke.call(ipcRenderer, channel, ...args)
        .then(result => {
            console.log(`IPC ${channel} succeeded:`,
                typeof result === 'object' ? 'Result is an object' : result);
            return result;
        })
        .catch(error => {
            console.error(`IPC ${channel} failed:`, error);
            throw error;
        });
};