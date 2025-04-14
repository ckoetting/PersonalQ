import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './ApiKeyModal.css';

const ApiKeyModal = ({ isOpen, onClose }) => {
    const { apiKeys, saveApiKeys } = useApp();

    const [formData, setFormData] = useState({
        ezekiaApiKey: apiKeys.ezekiaApiKey || '',
        openaiApiKey: apiKeys.openaiApiKey || ''
    });

    // Update form data when API keys change
    useEffect(() => {
        setFormData({
            ezekiaApiKey: apiKeys.ezekiaApiKey || '',
            openaiApiKey: apiKeys.openaiApiKey || ''
        });
    }, [apiKeys]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    if (!isOpen) return null;

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear any existing messages
        setError('');
        setSuccessMessage('');
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            console.log('Submitting API keys:', {
                ezekiaApiKey: formData.ezekiaApiKey ? 'Provided' : 'Not provided',
                openaiApiKey: formData.openaiApiKey ? 'Provided' : 'Not provided'
            });

            const result = await saveApiKeys(formData);

            if (result) {
                setSuccessMessage('API keys saved successfully!');

                // Wait a moment before closing the modal
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                throw new Error('Failed to save API keys. Please check your entries and try again.');
            }
        } catch (error) {
            console.error('API key save error:', error);
            setError(error.message || 'Failed to save API keys. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Determine if the Save button should be disabled
    const isSaveDisabled = !formData.ezekiaApiKey || !formData.openaiApiKey || loading;

    // Check if development mode to allow closing without keys
    const isDev = process.env.NODE_ENV === 'development';

    // Determine if user can close the modal (if they have already set up the keys or we're in development mode)
    const canClose = (apiKeys.ezekiaApiKey && apiKeys.openaiApiKey) || isDev;

    return (
        <div className="modal-overlay">
            <div className="api-key-modal">
                <div className="modal-header">
                    <h2>API Key Configuration</h2>
                    {canClose && (
                        <button className="close-button" onClick={onClose}>
                            &times;
                        </button>
                    )}
                </div>

                <div className="modal-content">
                    <p className="modal-description">
                        PersonalQ requires API keys to connect to Ezekia and OpenAI. Please enter your keys below.
                    </p>

                    {error && <div className="error-message">{error}</div>}
                    {successMessage && <div className="success-message">{successMessage}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="ezekiaApiKey" className="form-label">
                                Ezekia API Key
                            </label>
                            <input
                                type="password"
                                id="ezekiaApiKey"
                                name="ezekiaApiKey"
                                className="form-control"
                                value={formData.ezekiaApiKey}
                                onChange={handleInputChange}
                                placeholder="Enter your Ezekia API key"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="openaiApiKey" className="form-label">
                                OpenAI API Key
                            </label>
                            <input
                                type="password"
                                id="openaiApiKey"
                                name="openaiApiKey"
                                className="form-control"
                                value={formData.openaiApiKey}
                                onChange={handleInputChange}
                                placeholder="Enter your OpenAI API key"
                                required
                            />
                        </div>

                        <div className="modal-actions">
                            {canClose && (
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSaveDisabled}
                            >
                                {loading ? 'Saving...' : 'Save Keys'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyModal;