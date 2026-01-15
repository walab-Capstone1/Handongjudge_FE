// components/LoadingSpinner.jsx
import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message = "로딩 중...", size = "md" }) => {
    return (
        <div className="loading-spinner-container">
            <div className={`loading-spinner loading-spinner--${size}`}></div>
            {message && <p className="loading-spinner__message">{message}</p>}
        </div>
    );
};

export default LoadingSpinner;