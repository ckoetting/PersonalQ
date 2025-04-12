import React from 'react';
import { FaBriefcase, FaBuilding, FaCalendarAlt, FaUserTie } from 'react-icons/fa';
import './AssignmentDetails.css';

const AssignmentDetails = ({ assignment }) => {
    if (!assignment) return null;

    return (
        <div className="assignment-details">
            <div className="page-header">
                <h1 className="page-title">
                    <FaBriefcase /> Assignment Details
                </h1>
            </div>

            <div className="assignment-content">
                <div className="assignment-card card">
                    <h2 className="assignment-title">{assignment.name}</h2>

                    <div className="status-badge status-indicator status-badge-large status-badge-assignment status-badge-${assignment.status?.toLowerCase()}">
                        {assignment.status || 'Unknown'}
                    </div>

                    <div className="assignment-info-grid">
                        <div className="assignment-info-item">
                            <div className="info-label">
                                <FaBuilding /> Client
                            </div>
                            <div className="info-value">
                                {assignment.client?.name || 'N/A'}
                            </div>
                        </div>

                        <div className="assignment-info-item">
                            <div className="info-label">
                                <FaUserTie /> Contact
                            </div>
                            <div className="info-value">
                                {assignment.contactPerson || 'N/A'}
                            </div>
                        </div>

                        <div className="assignment-info-item">
                            <div className="info-label">
                                <FaCalendarAlt /> Created
                            </div>
                            <div className="info-value">
                                {assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="assignment-description card">
                    <h3 className="section-title">Description</h3>
                    <p className="description-text">
                        {assignment.description || 'No description available.'}
                    </p>
                </div>

                <div className="assignment-instructions">
                    <p className="instruction-text">
                        Select a candidate from the sidebar to view their details and generate a report.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AssignmentDetails;