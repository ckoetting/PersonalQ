import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import { AppProvider } from './context/AppContext';

// Load environment variables in development
if (process.env.NODE_ENV === 'development') {
    console.log('Running in development mode');
    // This is just for logging; actual env variables are loaded in electron.js
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <AppProvider>
            <App />
        </AppProvider>
    </React.StrictMode>
);