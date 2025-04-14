// src/components/Report/ReportDisplay.js
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ReportGenerator from '../../services/ReportGenerator';
import PdfGenerator from '../../services/PdfGenerator';
import { FaDownload, FaFilePdf, FaEdit, FaArrowLeft } from 'react-icons/fa';
import './ReportDisplay.css';

const ReportDisplay = ({ report, candidate, assignment }) => {
    const { setGeneratedReport, setError } = useApp();
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    // Handle markdown report download
    const handleMarkdownDownload = async () => {
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
            console.error('Failed to download markdown report:', error);
            setError('Failed to download report. Please try again.');
        }
    };

    // Handle PDF report generation and download using temp files
    const handlePdfDownload = async () => {
        try {
            setIsGeneratingPdf(true);

            // Create PDF generator
            const pdfGenerator = new PdfGenerator();

            // Generate PDF as base64 string
            const base64Content = await pdfGenerator.generatePdfBuffer(
                report.candidateData,
                report.reportSections,
                assignment
            );

            // Create temporary file
            const tempResult = await window.api.createTempPdfFile({
                content: base64Content
            });

            if (!tempResult.success) {
                throw new Error(tempResult.message || 'Failed to create temporary PDF file');
            }

            // Save from temporary file
            const saveResult = await window.api.savePdfFromTemp({
                tempFilePath: tempResult.tempFilePath,
                candidateName: report.candidateData.personal_data.name
            });

            if (!saveResult.success) {
                throw new Error(saveResult.message || 'Failed to save PDF');
            }

        } catch (error) {
            console.error('Failed to generate PDF:', error);
            setError('Failed to generate PDF report. Please try again.');
        } finally {
            setIsGeneratingPdf(false);
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
                    <button
                        className="action-button download-button"
                        onClick={handleMarkdownDownload}
                    >
                        <FaDownload /> Markdown
                    </button>
                    <button
                        className="action-button download-button pdf-button"
                        onClick={handlePdfDownload}
                        disabled={isGeneratingPdf}
                    >
                        <FaFilePdf /> {isGeneratingPdf ? 'Generating...' : 'PDF'}
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