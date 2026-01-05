import React from 'react';
import styled from 'styled-components';

const Footer = () => {
  return (
    <FooterContainer>
      <FooterWrapper>
        <FooterContent>
          <FooterText>연락처 및 기타 정보</FooterText>
          <FooterPlaceholder>
            <PlaceholderItem>이메일: contact@codesturdy.com</PlaceholderItem>
            <PlaceholderItem>전화: 000-0000-0000</PlaceholderItem>
            <PlaceholderItem>주소: 한동대학교</PlaceholderItem>
          </FooterPlaceholder>
        </FooterContent>
      </FooterWrapper>
    </FooterContainer>
  );
};

// Styled Components
const FooterContainer = styled.footer`
  width: 100%;
  background: #000000;
  color: white;
  margin-top: auto;
`;

const FooterWrapper = styled.div`
  max-width: 1152px;
  margin: 0 auto;
  width: 100%;
  padding: 16px 40px;
  box-sizing: border-box;
`;

const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FooterText = styled.p`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: white;
`;

const FooterPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PlaceholderItem = styled.div`
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
`;

export default Footer;

