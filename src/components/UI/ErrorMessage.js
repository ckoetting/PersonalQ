import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useApp } from '../../context/AppContext';
import './ErrorMessage.css';

const ErrorMessage = ({ message }) => {
    const { setError } = useApp();

    const handleDismiss = () => {
        setError(null);
    };

    return (
        <div className="error-message-container">
            <div className="error-message-content">
                <div className="error-icon">
                    <FaExclamationTriangle />
                </div>
                <div className="error-text">{message}</div>
                <button className="error-dismiss-button" onClick={handleDismiss}>
                    &times;
                </button>
            </div>
        </div>
    );
};

export default ErrorMessage;