import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import SearchBox from '../UI/SearchBox';
import LoadingSpinner from '../UI/LoadingSpinner';
import ReportGenerator from '../../services/ReportGenerator';
import './AssignmentList.css';

const AssignmentList = () => {
    const {
        apiKeys,
        assignments,
        setAssignments,
        setSelectedAssignment,
        loading,
        setLoading,
        setError
    } = useApp();

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredAssignments, setFilteredAssignments] = useState([]);

    // Fetch assignments when component mounts
    useEffect(() => {
        const fetchAssignments = async () => {
            if (!apiKeys.ezekiaApiKey) return;

            setLoading({ ...loading, assignments: true });
            console.log("Fetching assignments...");

            try {
                const reportGenerator = new ReportGenerator(apiKeys.ezekiaApiKey, apiKeys.openaiApiKey);
                console.log("ReportGenerator created, calling fetchAssignments()");

                const result = await reportGenerator.fetchAssignments();
                console.log("Assignments fetched:", result?.length || 0);

                if (result && result.length > 0) {
                    console.log("Sample assignment data:", result[0]);
                    setAssignments(result);
                    setFilteredAssignments(result);
                } else {
                    console.log("No assignments returned from API");
                    setAssignments([]);
                    setFilteredAssignments([]);
                }
            } catch (error) {
                console.error('Failed to fetch assignments:', error);
                setError('Failed to fetch assignments: ' + error.message);
                setAssignments([]);
                setFilteredAssignments([]);
            } finally {
                setLoading({ ...loading, assignments: false });
                console.log("Assignment loading complete");
            }
        };

        fetchAssignments();
    }, [apiKeys.ezekiaApiKey]);

    // Filter assignments based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredAssignments(assignments);
            return;
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filtered = assignments.filter(assignment =>
            (assignment.name || '').toLowerCase().includes(lowerCaseSearchTerm) ||
            (assignment.client?.name || '').toLowerCase().includes(lowerCaseSearchTerm)
        );

        setFilteredAssignments(filtered);
    }, [searchTerm, assignments]);

    // Handle assignment selection
    const handleAssignmentClick = (assignment) => {
        console.log("Assignment selected:", assignment);
        setSelectedAssignment(assignment);
    };

    // Helper function to safely format date
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString();
        } catch (e) {
            return 'Invalid Date';
        }
    };

    return (
        <div className="assignment-list">
            <SearchBox
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {loading.assignments ? (
                <LoadingSpinner />
            ) : filteredAssignments.length === 0 ? (
                <p className="no-results">No assignments found. Please check your API key and permissions.</p>
            ) : (
                <ul className="assignment-items">
                    {filteredAssignments.map(assignment => (
                        <li
                            key={assignment.id}
                            className="assignment-item"
                            onClick={() => handleAssignmentClick(assignment)}
                        >
                            <div className="assignment-name">{assignment.name || 'Unnamed Assignment'}</div>
                            <div className="assignment-client">{assignment.client?.name || 'No Client'}</div>
                            <div className="assignment-status">
                                <span className={`status-badge status-${(assignment.status || 'unknown').toLowerCase()}`}>
                                    {assignment.status || 'Unknown'}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AssignmentList;