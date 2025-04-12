import React, { useEffect } from 'react';
import './styles/index.css';
import Sidebar from './components/Layout/Sidebar';
import MainContent from './components/Layout/MainContent';
import { useApp } from './context/AppContext';
import ApiKeyModal from './components/UI/ApiKeyModal';

function App() {
    const { apiKeys, setError } = useApp();
    const [showApiKeyModal, setShowApiKeyModal] = React.useState(false);

    // Check if API keys are set
    useEffect(() => {
        if (!apiKeys.ezekiaApiKey || !apiKeys.openaiApiKey) {
            setShowApiKeyModal(true);
        }
    }, [apiKeys]);

    // Handle API errors
    useEffect(() => {
        const handleAPIErrors = (error) => {
            if (error && error.message) {
                setError(error.message);
            }
        };

        window.addEventListener('api-error', handleAPIErrors);
        return () => {
            window.removeEventListener('api-error', handleAPIErrors);
        };
    }, [setError]);

    return (
        <>
            <div className="app-container">
                <Sidebar />
                <MainContent />
            </div>

            {showApiKeyModal && (
                <ApiKeyModal
                    onClose={() => setShowApiKeyModal(false)}
                    isOpen={showApiKeyModal}
                />
            )}
        </>
    );
}

export default App;