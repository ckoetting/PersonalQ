import React from 'react';
import { useApp } from '../../context/AppContext';
import AssignmentDetails from '../Assignment/AssignmentDetails';
import CandidateDetails from '../Candidate/CandidateDetails';
import ReportDisplay from '../Report/ReportDisplay';
import WelcomeScreen from '../UI/WelcomeScreen';
import ErrorMessage from '../UI/ErrorMessage';
import './MainContent.css';

const MainContent = () => {
    const {
        selectedAssignment,
        selectedCandidate,
        generatedReport,
        error
    } = useApp();

    return (
        <div className="main-content">
            {error && <ErrorMessage message={error} />}

            {!selectedAssignment && !error && (
                <WelcomeScreen />
            )}

            {selectedAssignment && !selectedCandidate && !error && (
                <AssignmentDetails assignment={selectedAssignment} />
            )}

            {selectedAssignment && selectedCandidate && !generatedReport && !error && (
                <CandidateDetails candidate={selectedCandidate} />
            )}

            {selectedAssignment && selectedCandidate && generatedReport && !error && (
                <ReportDisplay
                    report={generatedReport}
                    candidate={selectedCandidate}
                    assignment={selectedAssignment}
                />
            )}
        </div>
    );
};

export default MainContent;