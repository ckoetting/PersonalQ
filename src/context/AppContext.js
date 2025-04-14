import React, { createContext, useState, useEffect, useContext } from 'react';

// Create a context
const AppContext = createContext();

// Create a provider component
export const AppProvider = ({ children }) => {
    // API key state
    const [apiKeys, setApiKeys] = useState({
        ezekiaApiKey: '',
        openaiApiKey: ''
    });

    // App state
    const [assignments, setAssignments] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [reportConfig, setReportConfig] = useState({
        includePersonal: true,
        includeExperience: true,
        includeEducation: true
    });
    const [generatedReport, setGeneratedReport] = useState(null);
    const [loading, setLoading] = useState({
        assignments: false,
        candidates: false,
        report: false
    });
    const [error, setError] = useState(null);

    // Get API keys on component mount
    useEffect(() => {
        const getKeys = async () => {
            try {
                console.log('Fetching API keys from storage/env');
                const keys = await window.api.getApiKeys();
                console.log('Keys received:', {
                    ezekiaApiKey: keys.ezekiaApiKey ? 'Found' : 'Not found',
                    openaiApiKey: keys.openaiApiKey ? 'Found' : 'Not found'
                });

                // Only update if we have at least one key or both are empty
                if (keys.ezekiaApiKey || keys.openaiApiKey ||
                    (!apiKeys.ezekiaApiKey && !apiKeys.openaiApiKey)) {
                    console.log('Setting API keys from storage/env');
                    setApiKeys(keys);
                }
            } catch (error) {
                console.error('Failed to load API keys:', error);
                setError('Failed to load API keys. Please check application settings.');
            }
        };

        getKeys();
    }, []);

    // Save API keys
    const saveApiKeys = async (newKeys) => {
        try {
            console.log('Saving API keys:', {
                ezekiaApiKey: newKeys.ezekiaApiKey ? 'Provided' : 'Not provided',
                openaiApiKey: newKeys.openaiApiKey ? 'Provided' : 'Not provided'
            });

            const result = await window.api.saveApiKeys(newKeys);

            if (result.success) {
                console.log('API keys saved successfully');
                setApiKeys(newKeys);
                return true;
            } else {
                console.error('Failed to save API keys:', result.message);
                setError(result.message || 'Failed to save API keys. Please try again.');
                return false;
            }
        } catch (error) {
            console.error('Failed to save API keys:', error);
            setError('Failed to save API keys. Please try again.');
            return false;
        }
    };

    // Reset state when changing assignments
    useEffect(() => {
        if (selectedAssignment) {
            setSelectedCandidate(null);
            setGeneratedReport(null);
        }
    }, [selectedAssignment]);

    // Reset report when changing candidates
    useEffect(() => {
        if (selectedCandidate) {
            setGeneratedReport(null);
        }
    }, [selectedCandidate]);

    // Context value
    const value = {
        apiKeys,
        setApiKeys,
        saveApiKeys,
        assignments,
        setAssignments,
        candidates,
        setCandidates,
        selectedAssignment,
        setSelectedAssignment,
        selectedCandidate,
        setSelectedCandidate,
        reportConfig,
        setReportConfig,
        generatedReport,
        setGeneratedReport,
        loading,
        setLoading,
        error,
        setError
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook for using the context
export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

export default AppContext;