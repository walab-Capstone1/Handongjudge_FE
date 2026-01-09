import React, { useState, useEffect } from 'react';
import APIService from '../services/APIService';
import './SubmissionHistory.css';

const SubmissionHistory = ({ problemId, sectionId, userId, onClose }) => {
    const [submissions, setSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, [problemId, sectionId, userId]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await APIService.getSubmissionHistory(problemId, sectionId, userId);
            const data = response.data || response;
            setSubmissions(data);
            if (data.length > 0) {
                setSelectedSubmission(data[0]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch submission history:', error);
            setLoading(false);
        }
    };

    const handleSubmissionClick = (submission) => {
        setSelectedSubmission(submission);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="submission-history-container">
            <div className="submission-sidebar">
                <h3>Submission History</h3>
                <div className="submission-list">
                    {loading ? (
                        <p>Loading...</p>
                    ) : submissions.length === 0 ? (
                        <p>No submissions found.</p>
                    ) : (
                        submissions.map((sub, index) => (
                            <div
                                key={sub.submissionId || index}
                                className={`submission - item ${selectedSubmission === sub ? 'active' : ''} `}
                                onClick={() => handleSubmissionClick(sub)}
                            >
                                <div className="submission-time">{formatDate(sub.submittedAt)}</div>
                                <div className={`submission - result ${sub.result === 'AC' ? 'success' : 'fail'} `}>
                                    {sub.result}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="submission-body">
                {selectedSubmission ? (
                    <>
                        <div className="submission-header">
                            <div className="stat-item">
                                <span className="label">Time:</span>
                                <span className="value">{selectedSubmission.executionTime ? `${selectedSubmission.executionTime} s` : 'N/A'}</span>
                            </div>
                            <div className="stat-item">
                                <span className="label">Memory:</span>
                                <span className="value">{selectedSubmission.memoryUsage ? `${selectedSubmission.memoryUsage} KB` : 'N/A'}</span>
                            </div>
                            <div className="stat-item">
                                <span className="label">Result:</span>
                                <span className={`value ${selectedSubmission.result === 'AC' ? 'success' : 'fail'} `}>
                                    {selectedSubmission.result}
                                </span>
                            </div>
                            <div className="stat-item">
                                <span className="label">Language:</span>
                                <span className="value">{selectedSubmission.language}</span>
                            </div>
                        </div>
                        <div className="code-viewer">
                            <pre>
                                <code>{selectedSubmission.code}</code>
                            </pre>
                        </div>
                    </>
                ) : (
                    <div className="no-selection">Select a submission to view details</div>
                )}
            </div>
            <button className="close-button" onClick={onClose}>X</button>
        </div>
    );
};

export default SubmissionHistory;
