import React from 'react';
import { FaSearch, FaUserTie, FaFileAlt } from 'react-icons/fa';
import './WelcomeScreen.css';

const WelcomeScreen = () => {
    return (
        <div className="welcome-screen">
            <div className="welcome-content">
                <div className="welcome-header">
                    <h1 className="welcome-title">Welcome to PersonalQ</h1>
                    <p className="welcome-subtitle">
                        Generate professional candidate reports for executive search
                    </p>
                </div>

                <div className="welcome-steps">
                    <div className="step-card">
                        <div className="step-icon">
                            <FaSearch />
                        </div>
                        <h3 className="step-title">Select Assignment</h3>
                        <p className="step-description">
                            Start by selecting an assignment from the sidebar. This will load all candidates associated with that assignment.
                        </p>
                    </div>

                    <div className="step-card">
                        <div className="step-icon">
                            <FaUserTie />
                        </div>
                        <h3 className="step-title">Choose Candidate</h3>
                        <p className="step-description">
                            Select a candidate to view their profile details and prepare to generate a report.
                        </p>
                    </div>

                    <div className="step-card">
                        <div className="step-icon">
                            <FaFileAlt />
                        </div>
                        <h3 className="step-title">Configure & Generate</h3>
                        <p className="step-description">
                            Configure what information to include in the report and generate a professional candidate summary.
                        </p>
                    </div>
                </div>

                <div className="welcome-footer">
                    <p className="version-info">PersonalQ v1.0.0</p>
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;