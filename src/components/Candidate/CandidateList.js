import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import SearchBox from '../UI/SearchBox';
import LoadingSpinner from '../UI/LoadingSpinner';
import ReportGenerator from '../../services/ReportGenerator';
import { FaUser } from 'react-icons/fa';
import './CandidateList.css';

const CandidateList = ({ assignmentId }) => {
    const {
        apiKeys,
        candidates,
        setCandidates,
        setSelectedCandidate,
        loading,
        setLoading,
        setError
    } = useApp();

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCandidates, setFilteredCandidates] = useState([]);

    // Fetch candidates when assignment changes
    useEffect(() => {
        const fetchCandidates = async () => {
            if (!apiKeys.ezekiaApiKey || !assignmentId) return;

            setLoading({ ...loading, candidates: true });

            try {
                const reportGenerator = new ReportGenerator(apiKeys.ezekiaApiKey, apiKeys.openaiApiKey);
                const result = await reportGenerator.fetchCandidates(assignmentId);
                setCandidates(result);
                setFilteredCandidates(result);
            } catch (error) {
                console.error('Failed to fetch candidates:', error);
                setError('Failed to fetch candidates. Please try again.');
            } finally {
                setLoading({ ...loading, candidates: false });
            }
        };

        fetchCandidates();
    }, [assignmentId, apiKeys.ezekiaApiKey]);

    // Filter candidates based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredCandidates(candidates);
            return;
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filtered = candidates.filter(candidate =>
            candidate.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            (candidate.positions && candidate.positions[0]?.title?.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (candidate.positions && candidate.positions[0]?.company?.name?.toLowerCase().includes(lowerCaseSearchTerm))
        );

        setFilteredCandidates(filtered);
    }, [searchTerm, candidates]);

    // Handle candidate selection
    const handleCandidateClick = (candidate) => {
        setSelectedCandidate(candidate);
    };

    return (
        <div className="candidate-list">
            <SearchBox
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {loading.candidates ? (
                <LoadingSpinner />
            ) : filteredCandidates.length === 0 ? (
                <p className="no-results">No candidates found</p>
            ) : (
                <ul className="candidate-items">
                    {filteredCandidates.map(candidate => (
                        <li
                            key={candidate.id}
                            className="candidate-item"
                            onClick={() => handleCandidateClick(candidate)}
                        >
                            <div className="candidate-avatar">
                                {candidate.photo ? (
                                    <img src={candidate.photo} alt={candidate.name} />
                                ) : (
                                    <FaUser />
                                )}
                            </div>
                            <div className="candidate-info">
                                <div className="candidate-name">{candidate.name}</div>
                                <div className="candidate-position">
                                    {candidate.positions && candidate.positions[0]?.title}
                                    {candidate.positions && candidate.positions[0]?.company && (
                                        <span> at {candidate.positions[0]?.company.name}</span>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CandidateList;