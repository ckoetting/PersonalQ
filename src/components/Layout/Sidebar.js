import React from 'react';
import { useApp } from '../../context/AppContext';
import './Sidebar.css';
import { FaHome, FaCog, FaUserTie, FaFileAlt, FaChartBar } from 'react-icons/fa';

const Sidebar = () => {
    const { apiKeys } = useApp();
    const [showSettings, setShowSettings] = React.useState(false);

    // Handle API key settings
    const handleSettingsClick = () => {
        setShowSettings(true);
    };

    // Currently we only have one page, but this is designed for future extension
    const navItems = [
        { icon: <FaHome />, name: 'Dashboard', active: true },
        { icon: <FaUserTie />, name: 'Candidates', active: false },
        { icon: <FaFileAlt />, name: 'Reports', active: false },
        { icon: <FaChartBar />, name: 'Analytics', active: false }
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <span className="logo-icon">P</span>
                    <h1>PersonalQ</h1>
                </div>
            </div>

            <div className="sidebar-nav">
                {navItems.map((item, index) => (
                    <div
                        key={index}
                        className={`nav-item ${item.active ? 'active' : ''}`}
                    >
                        <div className="nav-icon">{item.icon}</div>
                        <span className="nav-label">{item.name}</span>
                    </div>
                ))}
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
                <button
                    className="settings-button"
                    onClick={handleSettingsClick}
                    title="Settings"
                >
                    <FaCog />
                </button>
                <p className="version">v1.0.0</p>
            </div>
        </div>
    );
};

export default Sidebar;