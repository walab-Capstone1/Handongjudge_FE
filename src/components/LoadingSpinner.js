// components/LoadingSpinner.jsx
import React from 'react';
import {
  LoadingSpinnerContainer,
  LoadingSpinnerSm,
  LoadingSpinnerMd,
  LoadingSpinnerLg,
  LoadingSpinnerMessage
} from './styleddiv';

const LoadingSpinner = ({ message = "로딩 중...", size = "md" }) => {
    const SpinnerComponent = {
        sm: LoadingSpinnerSm,
        md: LoadingSpinnerMd,
        lg: LoadingSpinnerLg
    }[size] || LoadingSpinnerMd;

    return (
        <LoadingSpinnerContainer>
            <SpinnerComponent />
            {message && <LoadingSpinnerMessage>{message}</LoadingSpinnerMessage>}
        </LoadingSpinnerContainer>
    );
};

export default LoadingSpinner;