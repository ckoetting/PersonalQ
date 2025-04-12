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

            try {
                const reportGenerator = new ReportGenerator(apiKeys.ezekiaApiKey, apiKeys.openaiApiKey);
                const result = await reportGenerator.fetchAssignments();
                setAssignments(result);
                setFilteredAssignments(result);
            } catch (error) {
                console.error('Failed to fetch assignments:', error);
                setError('Failed to fetch assignments. Please check your API key and try again.');
            } finally {
                setLoading({ ...loading, assignments: false });
            }
        };

        fetchAssignments();
    }, [apiKeys.ezekiaApiKey]);

    // Filter assignments based on search term - FIXED
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
        setSelectedAssignment(assignment);
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
                <p className="no-results">No assignments found</p>
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