const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');
const Store = require('electron-store');
const axios = require('axios');

// Explicitly specify the env file path for debugging
const envPath = path.join(__dirname, '../.env');
console.log('Looking for .env file at:', envPath);

// Check if the .env file exists
if (fs.existsSync(envPath)) {
    console.log('.env file exists!');
    // Read and print the contents for debugging (be careful with sensitive data)
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    console.log('.env file contains:', envLines.length, 'lines');

    // Now load it with dotenv
    require('dotenv').config({ path: envPath });
} else {
    console.log('.env file NOT found!');
}

// Initialize the store with debug logging
Store.initRenderer();
const store = new Store({
    name: 'personalq-settings',
    encryptionKey: 'personalq-secure-key',
    clearInvalidConfig: true
});

// Debug logging of all store operations
const originalGet = store.get;
store.get = function(key, defaultValue) {
    const value = originalGet.call(this, key, defaultValue);
    console.log(`Store.get('${key}') called, returning:`, value ? 'Value found' : 'No value found');
    return value;
};

const originalSet = store.set;
store.set = function(key, value) {
    console.log(`Store.set('${key}') called with value:`, value ? 'Value provided' : 'No value provided');
    return originalSet.call(this, key, value);
};

// Log all environment variables (be careful with sensitive data)
console.log('Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('EZEKIA_API_KEY exists:', !!process.env.EZEKIA_API_KEY);
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);

// Log store data (be careful with sensitive data)
console.log('Store data:');
console.log('ezekiaApiKey exists in store:', !!store.get('ezekiaApiKey'));
console.log('openaiApiKey exists in store:', !!store.get('openaiApiKey'));

// Add a direct test function for IPC
ipcMain.handle('test-env-access', () => {
    return {
        envFileExists: fs.existsSync(envPath),
        envVarsExist: {
            ezekiaApiKey: !!process.env.EZEKIA_API_KEY,
            openaiApiKey: !!process.env.OPENAI_API_KEY
        },
        storeVarsExist: {
            ezekiaApiKey: !!store.get('ezekiaApiKey'),
            openaiApiKey: !!store.get('openaiApiKey')
        }
    };
});

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1024,
        minHeight: 768,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
        backgroundColor: '#1c1e33',
        icon: path.join(__dirname, 'logo.png')
    });

    // Load the app
    mainWindow.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, '../build/index.html')}`
    );

    // Open DevTools by default for debugging
    mainWindow.webContents.openDevTools();

    // Remove the menu bar
    mainWindow.setMenuBarVisibility(false);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Get API keys from store or environment variables
ipcMain.handle('get-api-keys', () => {
    try {
        console.log('get-api-keys IPC handler called');

        // First try to get from store
        let ezekiaApiKey = store.get('ezekiaApiKey', '');
        let openaiApiKey = store.get('openaiApiKey', '');

        console.log('Keys from store:', {
            ezekiaApiKey: ezekiaApiKey ? 'Found' : 'Not found',
            openaiApiKey: openaiApiKey ? 'Found' : 'Not found'
        });

        // If not in store, try environment variables
        if (!ezekiaApiKey) {
            console.log('Trying to get EZEKIA_API_KEY from env');
            ezekiaApiKey = process.env.EZEKIA_API_KEY || '';
            console.log('EZEKIA_API_KEY from env:', ezekiaApiKey ? 'Found' : 'Not found');

            // Save to store if found
            if (ezekiaApiKey) {
                console.log('Saving EZEKIA_API_KEY to store');
                store.set('ezekiaApiKey', ezekiaApiKey);
            }
        }

        if (!openaiApiKey) {
            console.log('Trying to get OPENAI_API_KEY from env');
            openaiApiKey = process.env.OPENAI_API_KEY || '';
            console.log('OPENAI_API_KEY from env:', openaiApiKey ? 'Found' : 'Not found');

            // Save to store if found
            if (openaiApiKey) {
                console.log('Saving OPENAI_API_KEY to store');
                store.set('openaiApiKey', openaiApiKey);
            }
        }

        return {
            ezekiaApiKey,
            openaiApiKey
        };
    } catch (error) {
        console.error('Error in get-api-keys:', error);
        return {
            ezekiaApiKey: '',
            openaiApiKey: '',
            error: error.message
        };
    }
});

// Save API keys to store
ipcMain.handle('save-api-keys', (event, { ezekiaApiKey, openaiApiKey }) => {
    try {
        console.log('save-api-keys IPC handler called with:', {
            ezekiaApiKey: ezekiaApiKey ? 'Provided' : 'Not provided',
            openaiApiKey: openaiApiKey ? 'Provided' : 'Not provided'
        });

        // Save to store
        store.set('ezekiaApiKey', ezekiaApiKey);
        store.set('openaiApiKey', openaiApiKey);

        // Verify
        const savedEzekiaKey = store.get('ezekiaApiKey', '');
        const savedOpenAIKey = store.get('openaiApiKey', '');

        console.log('Verify keys saved to store:', {
            ezekiaApiKey: (savedEzekiaKey === ezekiaApiKey) ? 'Match' : 'Mismatch',
            openaiApiKey: (savedOpenAIKey === openaiApiKey) ? 'Match' : 'Mismatch'
        });

        if (savedEzekiaKey !== ezekiaApiKey || savedOpenAIKey !== openaiApiKey) {
            console.error('Keys were not saved correctly to store');
            throw new Error('Keys were not saved correctly to store');
        }

        return { success: true };
    } catch (error) {
        console.error('Error in save-api-keys:', error);
        return { success: false, message: error.message };
    }
});

// Handle Ezekia API requests
ipcMain.handle('ezekia-request', async (event, { method, endpoint, params, data }) => {
    try {
        // Get API key from store or environment
        const ezekiaApiKey = store.get('ezekiaApiKey') || process.env.EZEKIA_API_KEY || '';

        if (!ezekiaApiKey) {
            return { error: true, message: 'API key not configured' };
        }

        const baseUrl = 'https://ezekia.com/api';
        const url = `${baseUrl}/${endpoint}`;

        console.log(`Making ${method} request to ${url}`);

        const response = await axios({
            method,
            url,
            headers: {
                'Authorization': `Bearer ${ezekiaApiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            params,
            data
        });

        return response.data;
    } catch (error) {
        console.error(`Ezekia API Error (${endpoint}):`, error);
        return {
            error: true,
            message: error.response?.data?.message || 'Failed to fetch data from Ezekia'
        };
    }
});