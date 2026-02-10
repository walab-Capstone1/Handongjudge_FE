import styled from "styled-components";

export const FooterContainer = styled.footer`
  width: 100%;
  background: #000000;
  color: white;
  margin-top: auto;
`;

export const FooterWrapper = styled.div`
  max-width: 1152px;
  margin: 0 auto;
  width: 100%;
  padding: 16px 40px;
  box-sizing: border-box;
`;

export const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const FooterText = styled.p`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: white;
`;

export const FooterPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const PlaceholderItem = styled.div`
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
`;
