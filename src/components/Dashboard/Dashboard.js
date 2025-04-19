import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import ReportGenerator from '../../services/ReportGenerator';
import {
    FaBriefcase, FaUserTie, FaFileAlt, FaSearch,
    FaBuilding, FaCalendarAlt, FaFilter, FaArrowRight,
    FaExclamationTriangle
} from 'react-icons/fa';
import LoadingSpinner from '../UI/LoadingSpinner';
import SearchBox from '../UI/SearchBox';
import ReportConfig from '../Report/ReportConfig';
import DashboardStats from './DashboardStats';
import './Dashboard.css';

// Error boundary component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Dashboard error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="dashboard-error">
                    <FaExclamationTriangle size={32} />
                    <h2>Something went wrong</h2>
                    <p>There was an error loading the dashboard content.</p>
                    <pre>{this.state.error?.toString()}</pre>
                    <button
                        className="btn btn-primary"
                        onClick={() => this.setState({ hasError: false })}
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

const Dashboard = () => {
    console.log("Dashboard component rendering");

    const {
        apiKeys,
        assignments,
        setAssignments,
        candidates,
        setCandidates,
        selectedAssignment,
        setSelectedAssignment,
        selectedCandidate,
        setSelectedCandidate,
        loading,
        setLoading,
        setError
    } = useApp();

    const [searchTermAssignment, setSearchTermAssignment] = useState('');
    const [searchTermCandidate, setSearchTermCandidate] = useState('');
    const [filteredAssignments, setFilteredAssignments] = useState([]);
    const [filteredCandidates, setFilteredCandidates] = useState([]);
    const [showAssignmentSelection, setShowAssignmentSelection] = useState(true);
    const [debugInfo, setDebugInfo] = useState(null);

    // Log component state for debugging
    console.log("Dashboard state:", {
        apiKeys: {
            ezekiaApiKey: apiKeys.ezekiaApiKey ? "Set" : "Not set",
            openaiApiKey: apiKeys.openaiApiKey ? "Set" : "Not set"
        },
        assignments: assignments?.length || 0,
        candidates: candidates?.length || 0,
        selectedAssignment: selectedAssignment?.id || null,
        selectedCandidate: selectedCandidate?.id || null,
        loading,
        showAssignmentSelection
    });

    // Fetch assignments when component mounts
    useEffect(() => {
        const fetchAssignments = async () => {
            if (!apiKeys.ezekiaApiKey) {
                console.log("No Ezekia API key, skipping assignment fetch");
                return;
            }

            setLoading({ ...loading, assignments: true });
            console.log("Fetching assignments...");

            try {
                const reportGenerator = new ReportGenerator(apiKeys.ezekiaApiKey, apiKeys.openaiApiKey);
                console.log("ReportGenerator created, calling fetchAssignments()");

                const result = await reportGenerator.fetchAssignments();
                console.log("Assignments fetched:", result?.length || 0);

                // Create fallback assignments if none returned
                if (!result || result.length === 0) {
                    console.log("No assignments returned, creating fallback");
                    const fallbackAssignments = [{
                        id: 'fallback-1',
                        name: 'Sample Assignment',
                        status: 'Active',
                        client: { name: 'Sample Client' },
                        createdAt: new Date().toISOString(),
                        candidates_count: 0
                    }];
                    setAssignments(fallbackAssignments);
                    setFilteredAssignments(fallbackAssignments);
                } else {
                    setAssignments(result);
                    setFilteredAssignments(result);
                }
            } catch (error) {
                console.error('Failed to fetch assignments:', error);
                setError('Failed to fetch assignments. Please check your API key and try again.');

                // Create debug info
                setDebugInfo({
                    error: error.toString(),
                    stack: error.stack,
                    message: error.message,
                    time: new Date().toISOString()
                });

                // Set fallback assignments for development
                if (process.env.NODE_ENV === 'development') {
                    console.log("Setting fallback assignments for development");
                    const fallbackAssignments = [{
                        id: 'fallback-1',
                        name: 'Development Assignment',
                        status: 'Active',
                        client: { name: 'Development Client' },
                        createdAt: new Date().toISOString(),
                        candidates_count: 0
                    }];
                    setAssignments(fallbackAssignments);
                    setFilteredAssignments(fallbackAssignments);
                }
            } finally {
                setLoading({ ...loading, assignments: false });
                console.log("Assignment loading complete");
            }
        };

        fetchAssignments();
    }, [apiKeys.ezekiaApiKey]);

    // Fetch candidates when assignment changes
    useEffect(() => {
        const fetchCandidates = async () => {
            if (!apiKeys.ezekiaApiKey || !selectedAssignment) {
                console.log("No API key or selected assignment, skipping candidate fetch");
                return;
            }

            setLoading({ ...loading, candidates: true });
            console.log("Fetching candidates for assignment:", selectedAssignment.id);

            try {
                const reportGenerator = new ReportGenerator(apiKeys.ezekiaApiKey, apiKeys.openaiApiKey);
                const result = await reportGenerator.fetchCandidates(selectedAssignment.id);
                console.log("Candidates fetched:", result?.length || 0);

                if (!result || result.length === 0) {
                    console.log("No candidates returned, creating fallback");
                    const fallbackCandidates = [{
                        id: 'fallback-candidate-1',
                        name: 'Sample Candidate',
                        status: 'Active',
                        positions: [{ title: 'Sample Position', company: { name: 'Sample Company' } }],
                        experience_years: '5'
                    }];
                    setCandidates(fallbackCandidates);
                    setFilteredCandidates(fallbackCandidates);
                } else {
                    setCandidates(result);
                    setFilteredCandidates(result);
                }
            } catch (error) {
                console.error('Failed to fetch candidates:', error);
                setError('Failed to fetch candidates. Please try again.');

                // Set fallback candidates for development
                if (process.env.NODE_ENV === 'development') {
                    console.log("Setting fallback candidates for development");
                    const fallbackCandidates = [{
                        id: 'fallback-candidate-1',
                        name: 'Development Candidate',
                        status: 'Active',
                        positions: [{ title: 'Development Position', company: { name: 'Development Company' } }],
                        experience_years: '5'
                    }];
                    setCandidates(fallbackCandidates);
                    setFilteredCandidates(fallbackCandidates);
                }
            } finally {
                setLoading({ ...loading, candidates: false });
                console.log("Candidate loading complete");
            }
        };

        fetchCandidates();
    }, [selectedAssignment, apiKeys.ezekiaApiKey]);

    // Filter assignments based on search term
    useEffect(() => {
        if (!searchTermAssignment.trim()) {
            setFilteredAssignments(assignments);
            return;
        }

        const lowerCaseSearchTerm = searchTermAssignment.toLowerCase();
        const filtered = assignments.filter(assignment =>
            (assignment.name || '').toLowerCase().includes(lowerCaseSearchTerm) ||
            (assignment.client?.name || '').toLowerCase().includes(lowerCaseSearchTerm)
        );

        setFilteredAssignments(filtered);
    }, [searchTermAssignment, assignments]);

    // Filter candidates based on search term
    useEffect(() => {
        if (!searchTermCandidate.trim()) {
            setFilteredCandidates(candidates);
            return;
        }

        const lowerCaseSearchTerm = searchTermCandidate.toLowerCase();
        const filtered = candidates.filter(candidate =>
            candidate.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            (candidate.positions && candidate.positions[0]?.title?.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (candidate.positions && candidate.positions[0]?.company?.name?.toLowerCase().includes(lowerCaseSearchTerm))
        );

        setFilteredCandidates(filtered);
    }, [searchTermCandidate, candidates]);

    // Handle assignment selection
    const handleAssignmentClick = (assignment) => {
        console.log("Assignment selected:", assignment.id);
        setSelectedAssignment(assignment);
        setSelectedCandidate(null);
        setShowAssignmentSelection(false);
    };

    // Handle candidate selection
    const handleCandidateClick = (candidate) => {
        console.log("Candidate selected:", candidate.id);
        setSelectedCandidate(candidate);
    };

    // Handle back to assignment selection
    const handleBackToAssignments = () => {
        console.log("Returning to assignment selection");
        setShowAssignmentSelection(true);
    };

    return (
        <ErrorBoundary>
            <div className="dashboard">
                <div className="dashboard-header">
                    <h1 className="dashboard-title">
                        {showAssignmentSelection ? (
                            <>
                                <FaBriefcase /> Assignments
                            </>
                        ) : selectedCandidate ? (
                            <>
                                <FaUserTie /> Candidate: {selectedCandidate.name}
                            </>
                        ) : (
                            <>
                                <FaBriefcase /> Assignment: {selectedAssignment?.name}
                            </>
                        )}
                    </h1>

                    <div className="dashboard-actions">
                        {!showAssignmentSelection && (
                            <button
                                className="btn btn-secondary back-button"
                                onClick={handleBackToAssignments}
                            >
                                Back to Assignments
                            </button>
                        )}
                    </div>
                </div>

                {/* Show debug info if available */}
                {debugInfo && (
                    <div className="debug-info">
                        <h3>Debug Information</h3>
                        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                    </div>
                )}

                <div className="dashboard-content">
                    {showAssignmentSelection ? (
                        /* Assignment Selection View */
                        <>
                            <DashboardStats
                                assignments={assignments}
                                candidates={candidates}
                                reports={[]}
                            />
                            <div className="selection-container">
                                <div className="selection-header">
                                    <h2 className="section-title">Select an Assignment</h2>
                                    <div className="search-filter-container">
                                        <SearchBox
                                            placeholder="Search assignments..."
                                            value={searchTermAssignment}
                                            onChange={(e) => setSearchTermAssignment(e.target.value)}
                                        />
                                        <button className="filter-button">
                                            <FaFilter /> Filter
                                        </button>
                                    </div>
                                </div>

                                {loading.assignments ? (
                                    <div className="loading-container">
                                        <LoadingSpinner size="large" />
                                        <p>Loading assignments...</p>
                                    </div>
                                ) : filteredAssignments.length === 0 ? (
                                    <div className="no-results">
                                        <p>No assignments found</p>
                                        {process.env.NODE_ENV === 'development' && (
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => {
                                                    const fallbackAssignments = [{
                                                        id: 'fallback-1',
                                                        name: 'Development Assignment',
                                                        status: 'Active',
                                                        client: { name: 'Development Client' },
                                                        createdAt: new Date().toISOString(),
                                                        candidates_count: 0
                                                    }];
                                                    setAssignments(fallbackAssignments);
                                                    setFilteredAssignments(fallbackAssignments);
                                                }}
                                            >
                                                Create Development Assignment
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="assignment-grid">
                                        {filteredAssignments.map(assignment => (
                                            <div
                                                key={assignment.id}
                                                className="assignment-card"
                                                onClick={() => handleAssignmentClick(assignment)}
                                            >
                                                <div className="assignment-card-header">
                                                    {assignment.client?.logo && (
                                                        <div className="company-logo">
                                                            <img
                                                                src={assignment.client.logo}
                                                                alt={`${assignment.client.name} logo`}
                                                                onError={(e) => {
                                                                    console.log("Failed to load company logo");
                                                                    e.target.style.display = 'none';
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                    <h3 className="assignment-name">{assignment.name || 'Unnamed Assignment'}</h3>
                                                    <span className={`status-badge status-${(assignment.status || 'unknown').toLowerCase()}`}>
        {assignment.status || 'Unknown'}
    </span>
                                                </div>

                                                <div className="assignment-card-content">
                                                    <div className="assignment-detail">
                                                        <FaBuilding className="detail-icon" />
                                                        <span className="detail-text">
                                                        {assignment.client?.name || 'No Client'}
                                                    </span>
                                                    </div>

                                                    <div className="assignment-detail">
                                                        <FaCalendarAlt className="detail-icon" />
                                                        <span className="detail-text">
                                                        {assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString() : 'N/A'}
                                                    </span>
                                                    </div>

                                                    <div className="assignment-detail">
                                                        <FaUserTie className="detail-icon" />
                                                        <span className="detail-text">
                                                        {assignment.candidates_count || 0} Candidates
                                                    </span>
                                                    </div>
                                                </div>

                                                <div className="assignment-card-footer">
                                                    <button className="btn-view">
                                                        View Details <FaArrowRight />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : selectedCandidate ? (
                        /* Candidate Detail View */
                        <div className="detail-view">
                            <div className="candidate-detail-card">
                                <div className="candidate-header">
                                    <div className="candidate-avatar-large">
                                        {selectedCandidate.photo ? (
                                            <img src={selectedCandidate.photo} alt={selectedCandidate.name} />
                                        ) : (
                                            <FaUserTie />
                                        )}
                                    </div>

                                    <div className="candidate-header-info">
                                        <h2 className="candidate-name-large">{selectedCandidate.name}</h2>

                                        {selectedCandidate.positions && selectedCandidate.positions.length > 0 && (
                                            <div className="candidate-current-position">
                                                {selectedCandidate.positions[0].title} at {selectedCandidate.positions[0].company?.name}
                                            </div>
                                        )}
                                    </div>

                                    <div className="report-config-container">
                                        <h3 className="config-title">
                                            <FaFileAlt /> Generate Report
                                        </h3>
                                        <ReportConfig
                                            candidateId={selectedCandidate.id}
                                            assignmentId={selectedAssignment.id}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Candidate Selection View */
                        <div className="selection-container">
                            <div className="selection-header">
                                <h2 className="section-title">Select a Candidate</h2>
                                <div className="search-filter-container">
                                    <SearchBox
                                        placeholder="Search candidates..."
                                        value={searchTermCandidate}
                                        onChange={(e) => setSearchTermCandidate(e.target.value)}
                                    />
                                    <button className="filter-button">
                                        <FaFilter /> Filter
                                    </button>
                                </div>
                            </div>

                            {loading.candidates ? (
                                <div className="loading-container">
                                    <LoadingSpinner size="large" />
                                    <p>Loading candidates...</p>
                                </div>
                            ) : filteredCandidates.length === 0 ? (
                                <div className="no-results">
                                    <p>No candidates found</p>
                                    {process.env.NODE_ENV === 'development' && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => {
                                                const fallbackCandidates = [{
                                                    id: 'fallback-candidate-1',
                                                    name: 'Development Candidate',
                                                    status: 'Active',
                                                    positions: [{ title: 'Development Position', company: { name: 'Development Company' } }],
                                                    experience_years: '5'
                                                }];
                                                setCandidates(fallbackCandidates);
                                                setFilteredCandidates(fallbackCandidates);
                                            }}
                                        >
                                            Create Development Candidate
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="candidate-grid">
                                    {filteredCandidates.map(candidate => (
                                        <div
                                            key={candidate.id}
                                            className="candidate-card"
                                            onClick={() => handleCandidateClick(candidate)}
                                        >
                                            <div className="candidate-card-header">
                                                <div className="candidate-avatar">
                                                    {candidate.photo ? (
                                                        <img src={candidate.photo} alt={candidate.name} />
                                                    ) : (
                                                        <FaUserTie />
                                                    )}
                                                </div>
                                                <h3 className="candidate-name">{candidate.name}</h3>
                                            </div>

                                            <div className="candidate-card-content">
                                                {candidate.positions && candidate.positions.length > 0 && (
                                                    <div className="candidate-position">
                                                        <div className="position-title">
                                                            {candidate.positions[0].title}
                                                        </div>
                                                        <div className="position-company">
                                                            at {candidate.positions[0].company?.name}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="candidate-metrics">
                                                    <div className="candidate-metric">
                                                        <span className="metric-label">Experience</span>
                                                        <span className="metric-value">
                                                            {candidate.experience_years || 'N/A'}
                                                        </span>
                                                    </div>

                                                    <div className="candidate-metric">
                                                        <span className="metric-label">Status</span>
                                                        <span className={`status-indicator status-${(candidate.status || 'active').toLowerCase()}`}>
                                                            {candidate.status || 'Active'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="candidate-card-footer">
                                                <button className="btn-view">
                                                    View Profile <FaArrowRight />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default Dashboard;