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
            if (!apiKeys.ezekiaApiKey || !assignmentId) {
                console.log("Missing API key or assignment ID, skipping candidate fetch");
                return;
            }

            setLoading({ ...loading, candidates: true });

            try {
                console.log(`Fetching candidates for assignment ${assignmentId}`);
                const reportGenerator = new ReportGenerator(apiKeys.ezekiaApiKey, apiKeys.openaiApiKey);
                const result = await reportGenerator.fetchCandidates(assignmentId);
                console.log("Candidates fetched:", result?.length || 0);

                if (result && result.length > 0) {
                    console.log("Sample candidate data:", result[0]);
                    setCandidates(result);
                    setFilteredCandidates(result);
                } else {
                    console.log("No candidates returned from API");
                    setCandidates([]);
                    setFilteredCandidates([]);
                }
            } catch (error) {
                console.error('Failed to fetch candidates:', error);
                setError('Failed to fetch candidates: ' + error.message);
                setCandidates([]);
                setFilteredCandidates([]);
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

    // Helper function to get company name safely
    const getCompanyName = (candidate) => {
        if (candidate.positions &&
            candidate.positions.length > 0 &&
            candidate.positions[0].company &&
            candidate.positions[0].company.name) {
            return candidate.positions[0].company.name;
        }
        return 'N/A';
    };

    // Helper function to get position title safely
    const getPositionTitle = (candidate) => {
        if (candidate.positions &&
            candidate.positions.length > 0 &&
            candidate.positions[0].title) {
            return candidate.positions[0].title;
        }
        return 'N/A';
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
                <p className="no-results">No candidates found for this assignment.</p>
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
                                    <img
                                        src={candidate.photo}
                                        alt={candidate.name}
                                        onError={(e) => {
                                            console.log("Failed to load candidate photo:", candidate.photo);
                                            e.target.style.display = 'none';
                                            // Use a cleaner approach to render the fallback icon
                                            const iconContainer = document.createElement('div');
                                            iconContainer.className = 'avatar-fallback-icon';
                                            iconContainer.innerHTML = '<i class="fa fa-user"></i>'; // Assuming you're using FontAwesome
                                            e.target.parentNode.appendChild(iconContainer);
                                        }}
                                    />
                                ) : (
                                    <div className="avatar-fallback-icon">
                                        <FaUser />
                                    </div>
                                )}
                            </div>
                            <div className="candidate-info">
                                <div className="candidate-name">{candidate.name}</div>
                                <div className="candidate-position">
                                    {getPositionTitle(candidate)}
                                    {getCompanyName(candidate) !== 'N/A' && (
                                        <span> at {getCompanyName(candidate)}</span>
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