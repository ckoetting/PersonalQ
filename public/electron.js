const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');
const Store = require('electron-store');
const axios = require('axios');

// Initialize the store for secure API key storage
Store.initRenderer();
const store = new Store({
    name: 'personalq-settings',
    encryptionKey: 'personalq-secure-key',
    clearInvalidConfig: true
});

// Configure environment variables based on development or production
console.log('Running in', isDev ? 'development' : 'production', 'mode');

// Determine the correct path for the .env file
const envPath = isDev
    ? path.join(__dirname, '../.env')             // Dev: one directory up from /public
    : path.join(process.resourcesPath, '.env');   // Prod: in the resources directory

console.log('Looking for .env file at:', envPath);

// Check if the .env file exists and load it
if (fs.existsSync(envPath)) {
    console.log('.env file found!');
    try {
        require('dotenv').config({ path: envPath });
        console.log('Environment variables loaded from .env file');
        console.log('EZEKIA_API_KEY exists:', !!process.env.EZEKIA_API_KEY);
        console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
    } catch (error) {
        console.error('Error loading .env file:', error);
    }
} else {
    console.log('.env file NOT found!');

    // Alternative approach: try default dotenv loading
    try {
        require('dotenv').config();
        console.log('Tried loading environment variables from default location');
        console.log('EZEKIA_API_KEY exists:', !!process.env.EZEKIA_API_KEY);
        console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
    } catch (error) {
        console.error('Error loading from default location:', error);
    }
}

// Log store data (be careful with sensitive data - just logging existence, not values)
console.log('API keys in Electron Store:');
console.log('ezekiaApiKey exists in store:', !!store.get('ezekiaApiKey'));
console.log('openaiApiKey exists in store:', !!store.get('openaiApiKey'));

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

    // Load the app from dev server or built files
    const startUrl = isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../build/index.html')}`;

    console.log('Loading application from:', startUrl);
    mainWindow.loadURL(startUrl);

    // Open DevTools in development mode
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    // Remove the menu bar
    mainWindow.setMenuBarVisibility(false);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    // On macOS, recreate window when dock icon is clicked
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC handler to test environment and configuration
ipcMain.handle('test-env-access', () => {
    return {
        envFileExists: fs.existsSync(envPath),
        envPath: envPath,
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

// Handle Ezekia API requests - UPDATED to handle fields[] correctly
ipcMain.handle('ezekia-request', async (event, { method, endpoint, params, data, fieldsArray }) => {
    try {
        // Get API key from store or environment
        const ezekiaApiKey = store.get('ezekiaApiKey') || process.env.EZEKIA_API_KEY || '';

        if (!ezekiaApiKey) {
            return { error: true, message: 'Ezekia API key not configured' };
        }

        const baseUrl = 'https://ezekia.com/api';
        const url = `${baseUrl}/${endpoint}`;

        console.log(`Making ${method} request to ${url}`);

        // Handle fields[] parameter correctly
        if (fieldsArray && fieldsArray.length > 0) {
            console.log('Processing fields array:', fieldsArray);
            // Convert fieldsArray to correct URL parameters - append multiple fields[] parameters
            if (!params) params = {};
            params['fields[]'] = fieldsArray;
        }

        console.log('Request params:', params);

        const response = await axios({
            method,
            url,
            headers: {
                'Authorization': `Bearer ${ezekiaApiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            params,
            data,
            paramsSerializer: function(params) {
                // Convert params object to URL query string format, handling arrays correctly
                let parts = [];
                for (let key in params) {
                    if (Array.isArray(params[key])) {
                        // For arrays like fields[], add multiple entries with the same key
                        params[key].forEach(value => {
                            parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
                        });
                    } else {
                        parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
                    }
                }
                return parts.join('&');
            }
        });

        return response.data;
    } catch (error) {
        console.error(`Ezekia API Error (${endpoint}):`, error);
        console.error('Error details:', error.response?.data || error.message);

        return {
            error: true,
            message: error.response?.data?.message || error.message || 'Failed to fetch data from Ezekia'
        };
    }
});

// Handle saving reports to file
ipcMain.handle('save-report', async (event, reportData) => {
    try {
        console.log('Handling save-report request');

        const defaultPath = path.join(
            app.getPath('documents'),
            `${reportData.candidateName.replace(/[^a-z0-9]/gi, '_')}_Report.md`
        );

        const { filePath } = await dialog.showSaveDialog({
            title: 'Save Candidate Report',
            defaultPath: defaultPath,
            filters: [
                { name: 'Markdown', extensions: ['md'] },
                { name: 'Text', extensions: ['txt'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (!filePath) {
            return { success: false, message: 'Save cancelled by user' };
        }

        fs.writeFileSync(filePath, reportData.content, 'utf-8');
        console.log('Report saved successfully to:', filePath);

        return { success: true, filePath };
    } catch (error) {
        console.error('Failed to save report:', error);
        return { success: false, message: error.message };
    }
});