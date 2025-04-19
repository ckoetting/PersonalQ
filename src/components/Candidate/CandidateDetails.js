import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FaUser, FaEnvelope, FaPhone, FaGlobe, FaGraduationCap, FaBriefcase } from 'react-icons/fa';
import ReportGenerator from '../../services/ReportGenerator';
import LoadingSpinner from '../UI/LoadingSpinner';
import './CandidateDetails.css';

const CandidateDetails = ({ candidate }) => {
    const { apiKeys, loading, setLoading, setError } = useApp();
    const [candidateData, setCandidateData] = useState(null);

    useEffect(() => {
        const fetchCandidateDetails = async () => {
            if (!candidate || !apiKeys.ezekiaApiKey) return;

            setLoading({ ...loading, candidateDetails: true });
            console.log(`Fetching details for candidate ${candidate.id}`);

            try {
                const reportGenerator = new ReportGenerator(apiKeys.ezekiaApiKey, apiKeys.openaiApiKey);
                const data = await reportGenerator.ezekiaClient.getAllCandidateData(candidate.id);
                console.log("Candidate data received:", data);
                setCandidateData(data);
            } catch (error) {
                console.error('Failed to fetch candidate details:', error);
                setError('Failed to fetch candidate details. Please try again.');
            } finally {
                setLoading({ ...loading, candidateDetails: false });
            }
        };

        fetchCandidateDetails();
    }, [candidate, apiKeys.ezekiaApiKey]);

    if (!candidate) return null;

    if (loading.candidateDetails) {
        return (
            <div className="candidate-details-loading">
                <LoadingSpinner size="large" />
                <p>Loading candidate details...</p>
            </div>
        );
    }

    if (!candidateData) {
        return (
            <div className="candidate-details-error">
                <p>No candidate data available. Please try again.</p>
            </div>
        );
    }

    const { personal_data, experience, education } = candidateData;

    return (
        <div className="candidate-details">
            <div className="page-header">
                <h1 className="page-title">
                    <FaUser /> Candidate Profile
                </h1>
            </div>

            <div className="candidate-content">
                <div className="candidate-header card">
                    <div className="candidate-header-info">
                        <div className="candidate-avatar-large">
                            {personal_data.photo ? (
                                <img
                                    src={personal_data.photo}
                                    alt={personal_data.name}
                                    onError={(e) => {
                                        console.log("Failed to load candidate photo:", personal_data.photo);
                                        e.target.style.display = 'none';
                                        const iconContainer = document.createElement('div');
                                        iconContainer.className = 'avatar-fallback-icon-large';
                                        iconContainer.innerHTML = '<i class="fa fa-user"></i>';
                                        e.target.parentNode.appendChild(iconContainer);
                                    }}
                                />
                            ) : (
                                <div className="avatar-fallback-icon-large">
                                    <FaUser />
                                </div>
                            )}
                        </div>

                        <div className="candidate-header-text">
                            <h2 className="candidate-name-large">{personal_data.name}</h2>

                            {experience && experience.length > 0 && (
                                <div className="candidate-current-position">
                                    {experience[0].title || 'No title'} at {experience[0].company || 'No company'}
                                </div>
                            )}

                            <div className="candidate-contact-info">
                                {personal_data.email && (
                                    <div className="contact-item">
                                        <FaEnvelope /> {personal_data.email}
                                    </div>
                                )}

                                {personal_data.phone && (
                                    <div className="contact-item">
                                        <FaPhone /> {personal_data.phone}
                                    </div>
                                )}

                                {personal_data.nationality && (
                                    <div className="contact-item">
                                        <FaGlobe /> {personal_data.nationality}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="candidate-section card">
                    <h3 className="section-title">
                        <FaBriefcase /> Work Experience
                    </h3>

                    <div className="experience-list">
                        {experience && experience.length > 0 ? (
                            experience.map((exp, index) => (
                                <div className="experience-item" key={index}>
                                    <div className="experience-header">
                                        <div className="experience-title">{exp.title || 'No title'}</div>
                                        <div className="experience-company">{exp.company || 'No company'}</div>
                                        <div className="experience-years">{exp.years || 'No date information'}</div>
                                    </div>

                                    {exp.description && (
                                        <div className="experience-description">
                                            {exp.description}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="no-data">No work experience data available.</div>
                        )}
                    </div>
                </div>

                <div className="candidate-section card">
                    <h3 className="section-title">
                        <FaGraduationCap /> Education
                    </h3>

                    <div className="education-list">
                        {education && education.length > 0 ? (
                            education.map((edu, index) => (
                                <div className="education-item" key={index}>
                                    <div className="education-header">
                                        <div className="education-degree">{edu.degree || 'No degree information'}</div>
                                        <div className="education-institution">{edu.institution || 'No institution information'}</div>
                                        <div className="education-years">{edu.years || 'No date information'}</div>
                                    </div>

                                    {edu.field && (
                                        <div className="education-field">
                                            Field of Study: {edu.field}
                                        </div>
                                    )}

                                    {edu.description && (
                                        <div className="education-description">
                                            {edu.description}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="no-data">No education data available.</div>
                        )}
                    </div>
                </div>

                <div className="candidate-instructions">
                    <p className="instruction-text">
                        Configure and generate a report using the options in the sidebar.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CandidateDetails;