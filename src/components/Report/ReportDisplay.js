import React from 'react';
import { useApp } from '../../context/AppContext';
import ReportGenerator from '../../services/ReportGenerator';
import { FaDownload, FaEdit, FaArrowLeft } from 'react-icons/fa';
import './ReportDisplay.css';

const ReportDisplay = ({ report, candidate, assignment }) => {
    const { setGeneratedReport, setError } = useApp();

    // Handle report download
    const handleDownload = async () => {
        try {
            const reportGenerator = new ReportGenerator();
            const markdownContent = reportGenerator.createMarkdownReport(
                report.candidateData,
                report.reportSections
            );

            const result = await window.api.saveReport({
                content: markdownContent,
                candidateName: report.candidateData.personal_data.name
            });

            if (!result.success) {
                throw new Error(result.message || 'Failed to save report');
            }
        } catch (error) {
            console.error('Failed to download report:', error);
            setError('Failed to download report. Please try again.');
        }
    };

    // Handle back button click
    const handleBackClick = () => {
        setGeneratedReport(null);
    };

    // Handle edit button click
    const handleEditClick = () => {
        // For future implementation: edit functionality
        alert('Edit functionality will be available in a future update.');
    };

    return (
        <div className="report-display">
            <div className="report-header">
                <button className="back-button" onClick={handleBackClick}>
                    <FaArrowLeft /> Back
                </button>

                <h1>Report for {report.candidateData.personal_data.name}</h1>

                <div className="report-actions">
                    <button className="action-button edit-button" onClick={handleEditClick}>
                        <FaEdit /> Edit
                    </button>
                    <button className="action-button download-button" onClick={handleDownload}>
                        <FaDownload /> Download
                    </button>
                </div>
            </div>

            <div className="report-content">
                <div className="report-section">
                    <h2>PERSÖNLICHKEIT</h2>
                    <div className="report-text">
                        {report.reportSections.personality_section}
                    </div>
                </div>

                <div className="report-section">
                    <h2>ZUSAMMENFASSUNG</h2>
                    <div className="report-text">
                        {report.reportSections.summary_section}
                    </div>
                </div>
            </div>

            <div className="report-footer">
                <div className="report-metadata">
                    <div className="metadata-item">
                        <span className="metadata-label">Assignment:</span>
                        <span className="metadata-value">{assignment.name}</span>
                    </div>
                    <div className="metadata-item">
                        <span className="metadata-label">Generated on:</span>
                        <span className="metadata-value">{new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportDisplay;