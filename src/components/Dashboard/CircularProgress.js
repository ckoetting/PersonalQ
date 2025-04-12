import React from 'react';
import './CircularProgress.css';

// SVG gradient definition that will be used by all progress components
const GradientDef = () => (
    <svg className="gradient-defs" width="0" height="0">
        <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3c4fe0" />
                <stop offset="100%" stopColor="#6a78ff" />
            </linearGradient>
        </defs>
    </svg>
);

const CircularProgress = ({ value, max, size = 'medium', label, sublabel }) => {
    const percentage = (value / max) * 100;
    const circumference = 2 * Math.PI * 45; // 45 is the radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const sizeClass = `progress-${size}`;

    return (
        <>
            <GradientDef />
            <div className={`circular-progress-container ${sizeClass}`}>
                <div className="circular-progress">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <circle
                            className="progress-background"
                            cx="50"
                            cy="50"
                            r="45"
                        />
                        <circle
                            className="progress-value"
                            cx="50"
                            cy="50"
                            r="45"
                            style={{
                                strokeDasharray: circumference,
                                strokeDashoffset: strokeDashoffset
                            }}
                        />
                    </svg>
                    <div className="progress-content">
                        {label && <div className="progress-label">{label}</div>}
                        {sublabel && <div className="progress-sublabel">{sublabel}</div>}
                    </div>
                </div>
            </div>
        </>
    );
};

export default CircularProgress;