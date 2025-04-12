import React from 'react';
import { useApp } from '../../context/AppContext';
import Dashboard from '../Dashboard/Dashboard';
import ReportDisplay from '../Report/ReportDisplay';
import WelcomeScreen from '../UI/WelcomeScreen';
import ErrorMessage from '../UI/ErrorMessage';
import './MainContent.css';

const MainContent = () => {
    const {
        generatedReport,
        error,
        selectedAssignment,
        selectedCandidate
    } = useApp();

    return (
        <div className="main-content">
            {error && <ErrorMessage message={error} />}

            {!generatedReport ? (
                <Dashboard />
            ) : (
                <ReportDisplay
                    report={generatedReport}
                    candidate={selectedCandidate}
                    assignment={selectedAssignment}
                />
            )}
        </div>
    );
};

export default MainContent;