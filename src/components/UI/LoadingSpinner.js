import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium' }) => {
    const sizeClass = `spinner-${size}`;

    return (
        <div className={`loading-spinner-container ${sizeClass}`}>
            <div className="loading-spinner"></div>
        </div>
    );
};

export default LoadingSpinner;