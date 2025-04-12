import React from 'react';
import { useApp } from '../../context/AppContext';
import AssignmentList from '../Assignment/AssignmentList';
import CandidateList from '../Candidate/CandidateList';
import ReportConfig from '../Report/ReportConfig';
import './Sidebar.css';
import { FaCog, FaSearch, FaUser, FaFileAlt } from 'react-icons/fa';

const Sidebar = () => {
    const {
        selectedAssignment,
        selectedCandidate,
        setGeneratedReport,
        loading,
        setLoading,
        setError,
        apiKeys
    } = useApp();

    const [showSettings, setShowSettings] = React.useState(false);

    // Handle API key settings
    const handleSettingsClick = () => {
        setShowSettings(true);
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <span className="logo-icon">P</span>
                    <h1>PersonalQ</h1>
                </div>
                <button
                    className="settings-button"
                    onClick={handleSettingsClick}
                    title="Settings"
                >
                    <FaCog />
                </button>
            </div>

            <div className="sidebar-content">
                <div className="sidebar-section">
                    <h2><FaSearch /> Assignments</h2>
                    <AssignmentList />
                </div>

                {selectedAssignment && (
                    <div className="sidebar-section">
                        <h2><FaUser /> Candidates</h2>
                        <CandidateList assignmentId={selectedAssignment.id} />
                    </div>
                )}

                {selectedAssignment && selectedCandidate && (
                    <div className="sidebar-section">
                        <h2><FaFileAlt /> Report Config</h2>
                        <ReportConfig
                            candidateId={selectedCandidate.id}
                            assignmentId={selectedAssignment.id}
                        />
                    </div>
                )}
            </div>

            <div className="sidebar-footer">
                <div className="api-status">
                    <div className={`status-indicator ${apiKeys.ezekiaApiKey ? 'connected' : 'disconnected'}`}>
                        Ezekia API: {apiKeys.ezekiaApiKey ? 'Connected' : 'Not Connected'}
                    </div>
                    <div className={`status-indicator ${apiKeys.openaiApiKey ? 'connected' : 'disconnected'}`}>
                        OpenAI API: {apiKeys.openaiApiKey ? 'Connected' : 'Not Connected'}
                    </div>
                </div>
                <p className="version">v1.0.0</p>
            </div>
        </div>
    );
};

export default Sidebar;