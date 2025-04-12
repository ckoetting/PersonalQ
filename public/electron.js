const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');
const Store = require('electron-store');
const axios = require('axios'); // Add axios for API requests
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Initialize the store for app settings
const store = new Store();

// Log environment variables for debugging
console.log('Environment variables loaded:');
console.log('EZEKIA_API_KEY:', process.env.EZEKIA_API_KEY ? 'Found' : 'Not found');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Found' : 'Not found');

let mainWindow;

function createWindow() {
    // Create the browser window
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
        backgroundColor: '#282c34', // Dark background color that matches the dashboard theme
        icon: path.join(__dirname, '../assets/images/logo.png')
    });

    // Load the app
    mainWindow.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, '../build/index.html')}`
    );

    // Open DevTools in development mode
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    // Remove the menu bar
    mainWindow.setMenuBarVisibility(false);

    // Handle window close
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Create window when app is ready
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// On macOS, create a window when icon is clicked
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// IPC handlers for communication with the renderer process

// Save report to file
ipcMain.handle('save-report', async (event, { content, candidateName }) => {
    try {
        const { filePath } = await dialog.showSaveDialog({
            title: 'Save Report',
            defaultPath: `${candidateName.replace(/\s+/g, '_')}_report.md`,
            filters: [
                { name: 'Markdown', extensions: ['md'] },
                { name: 'Text', extensions: ['txt'] }
            ]
        });

        if (filePath) {
            fs.writeFileSync(filePath, content, 'utf8');
            return { success: true, filePath };
        }
        return { success: false, message: 'File save cancelled' };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

// Get API keys from store or environment variables
ipcMain.handle('get-api-keys', () => {
    // First try to get from store
    let ezekiaApiKey = store.get('ezekiaApiKey', '');
    let openaiApiKey = store.get('openaiApiKey', '');

    // If not in store, try to get from environment variables
    if (!ezekiaApiKey) {
        ezekiaApiKey = process.env.EZEKIA_API_KEY || '';
        // If we got it from env, save to store
        if (ezekiaApiKey) {
            store.set('ezekiaApiKey', ezekiaApiKey);
        }
    }

    if (!openaiApiKey) {
        openaiApiKey = process.env.OPENAI_API_KEY || '';
        // If we got it from env, save to store
        if (openaiApiKey) {
            store.set('openaiApiKey', openaiApiKey);
        }
    }

    return {
        ezekiaApiKey,
        openaiApiKey
    };
});

// Save API keys to store
ipcMain.handle('save-api-keys', (event, { ezekiaApiKey, openaiApiKey }) => {
    store.set('ezekiaApiKey', ezekiaApiKey);
    store.set('openaiApiKey', openaiApiKey);
    return { success: true };
});

// Handle Ezekia API requests (bypassing CORS)
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