import React from 'react';
import CircularProgress from './CircularProgress';
import { FaBriefcase, FaUserTie, FaFileAlt, FaChartLine } from 'react-icons/fa';
import './DashboardStats.css';

const DashboardStats = ({ assignments, candidates, reports }) => {
    // Calculate statistics
    const totalAssignments = assignments?.length || 0;
    const activeAssignments = assignments?.filter(a => a.status === 'Active').length || 0;
    const assignmentPercentage = totalAssignments ? Math.round((activeAssignments / totalAssignments) * 100) : 0;

    const totalCandidates = candidates?.length || 0;
    const activeCandidates = candidates?.filter(c => c.status === 'Active').length || 0;
    const candidatePercentage = totalCandidates ? Math.round((activeCandidates / totalCandidates) * 100) : 0;

    const totalReports = reports?.length || 0;

    return (
        <div className="dashboard-stats">
            <div className="stats-header">
                <h2 className="stats-title">Overview</h2>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <FaBriefcase />
                    </div>
                    <div className="stat-content">
                        <div className="stat-primary">
                            <CircularProgress
                                value={activeAssignments}
                                max={totalAssignments || 1}
                                size="small"
                                label={`${assignmentPercentage}%`}
                            />
                        </div>
                        <div className="stat-info">
                            <div className="stat-label">Assignments</div>
                            <div className="stat-value">{activeAssignments} active</div>
                            <div className="stat-detail">of {totalAssignments} total</div>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FaUserTie />
                    </div>
                    <div className="stat-content">
                        <div className="stat-primary">
                            <CircularProgress
                                value={activeCandidates}
                                max={totalCandidates || 1}
                                size="small"
                                label={`${candidatePercentage}%`}
                            />
                        </div>
                        <div className="stat-info">
                            <div className="stat-label">Candidates</div>
                            <div className="stat-value">{activeCandidates} active</div>
                            <div className="stat-detail">of {totalCandidates} total</div>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FaFileAlt />
                    </div>
                    <div className="stat-content">
                        <div className="stat-primary">
                            <div className="stat-number">{totalReports}</div>
                        </div>
                        <div className="stat-info">
                            <div className="stat-label">Reports</div>
                            <div className="stat-detail">Generated this month</div>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FaChartLine />
                    </div>
                    <div className="stat-content">
                        <div className="stat-primary">
                            <div className="stat-efficiency">82%</div>
                        </div>
                        <div className="stat-info">
                            <div className="stat-label">Efficiency</div>
                            <div className="stat-detail">Based on 56 parameters</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;