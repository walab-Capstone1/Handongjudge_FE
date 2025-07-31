// components/LoadingSpinner.jsx
import React from 'react';
import styled from 'styled-components';

const LoadingSpinner = ({ message = "로딩 중..." }) => {
    return (
        <Container>
            <Spinner />
            <Message>{message}</Message>
        </Container>
    );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Message = styled.p`
  margin-top: 16px;
  color: #6b7280;
  font-size: 14px;
`;

export default LoadingSpinner;