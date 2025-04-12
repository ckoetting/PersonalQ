import React from 'react';
import { useApp } from '../../context/AppContext';
import ReportGenerator from '../../services/ReportGenerator';
import './ReportConfig.css';

const ReportConfig = ({ candidateId, assignmentId }) => {
    const {
        apiKeys,
        reportConfig,
        setReportConfig,
        setGeneratedReport,
        loading,
        setLoading,
        setError
    } = useApp();

    // Handle checkbox changes
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setReportConfig({ ...reportConfig, [name]: checked });
    };

    // Generate report
    const handleGenerateReport = async () => {
        if (!apiKeys.ezekiaApiKey || !apiKeys.openaiApiKey) {
            setError('API keys are not configured. Please check your settings.');
            return;
        }

        if (!candidateId || !assignmentId) {
            setError('No candidate or assignment selected.');
            return;
        }

        setLoading({ ...loading, report: true });

        try {
            const reportGenerator = new ReportGenerator(
                apiKeys.ezekiaApiKey,
                apiKeys.openaiApiKey
            );

            const reportData = await reportGenerator.generateReport(
                candidateId,
                assignmentId,
                reportConfig
            );

            setGeneratedReport(reportData);
        } catch (error) {
            console.error('Failed to generate report:', error);
            setError('Failed to generate report. Please try again.');
        } finally {
            setLoading({ ...loading, report: false });
        }
    };

    return (
        <div className="report-config">
            <div className="config-options">
                <div className="config-option">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            name="includePersonal"
                            checked={reportConfig.includePersonal}
                            onChange={handleCheckboxChange}
                        />
                        <span className="checkbox-text">Include Personal Info</span>
                    </label>
                </div>

                <div className="config-option">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            name="includeExperience"
                            checked={reportConfig.includeExperience}
                            onChange={handleCheckboxChange}
                        />
                        <span className="checkbox-text">Include Work Experience</span>
                    </label>
                </div>

                <div className="config-option">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            name="includeEducation"
                            checked={reportConfig.includeEducation}
                            onChange={handleCheckboxChange}
                        />
                        <span className="checkbox-text">Include Education</span>
                    </label>
                </div>
            </div>

            <button
                className="generate-button"
                onClick={handleGenerateReport}
                disabled={loading.report || (!reportConfig.includePersonal && !reportConfig.includeExperience && !reportConfig.includeEducation)}
            >
                {loading.report ? 'Generating...' : 'Generate Report'}
            </button>
        </div>
    );
};

export default ReportConfig;