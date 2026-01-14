import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FaGraduationCap, FaPencilAlt, FaCog, FaPlus } from "react-icons/fa";
import Silk from "../components/Silk";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../hooks/useAuth";

const IndexPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("lectures");
  
  // useAuth에서 사용자 정보 가져오기
  const userName = user?.name || user?.username || user?.email || "사용자 이름";

  const handleGoToClassroom = () => {
    navigate("/courses");
  };

  const handleLecturesClick = () => {
    navigate("/courses");
  };
  const handleManagementClick = () => {
    navigate("/admin");
  };

  return (
    <IndexContainer>
      <Header userName={userName} />

      <HeroAndTabSection>
        <HeroBackground>
          <Silk speed={1} scale={1.5} color="#6e74c4" noiseIntensity={1.5} rotation={0} />
        </HeroBackground>
        <HeroSection>
          <HeroContentWrapper>
            <HeroContent>
              <HeroTitle>Code Sturdy</HeroTitle>
              <HeroDescription>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sit amet risus nisi, integer firibus faucibus pours. Maecenas pharetra eropuest
              </HeroDescription>
            </HeroContent>
            <HeroButton onClick={handleGoToClassroom}>
              내 강의실로 가기
              <FaGraduationCap />
            </HeroButton>
          </HeroContentWrapper>
        </HeroSection>

        <TabNavigation>
          <Tab
            active={activeTab === "lectures"}
            onClick={handleLecturesClick}
          >
            <FaGraduationCap />
            수강 강의
          </Tab>
          <Tab
            active={activeTab === "management"}
            //onClick={() => setActiveTab("management")}
            onClick={handleManagementClick}
          >
            <FaPencilAlt />
            강의 관리
          </Tab>
          <Tab
            active={activeTab === "system"}
            onClick={() => setActiveTab("system")}
          >
            <FaCog />
            시스템 관리
          </Tab>
      </TabNavigation>
      </HeroAndTabSection>

      <MainContent>
        <ContentPanel>
          <PanelHeader>
            <PanelTitle>공지사항 - Notice</PanelTitle>
            <PanelActionButton>
              <FaPlus />
            </PanelActionButton>
          </PanelHeader>
          <PanelList>
            <PanelItem>
              <ItemText>Code Stury 정경 시간 사전 공지</ItemText>
              <ItemDate>2026.1.20</ItemDate>
            </PanelItem>
            <PanelItem>
              <ItemText>Code Stury 점검시간 사전 공지</ItemText>
              <ItemDate>2026.1.20</ItemDate>
            </PanelItem>
            <PanelItem>
              <ItemText>Code Stury 점검 시간 사전 공지</ItemText>
              <ItemDate>2026.1.20</ItemDate>
            </PanelItem>
          </PanelList>
        </ContentPanel>

        <ContentPanel>
          <PanelHeader>
            <PanelTitle>이용안내 - Guide</PanelTitle>
            <PanelActionButton>
              <FaPlus />
            </PanelActionButton>
          </PanelHeader>
          <PanelList>
            <PanelItem>
              <ItemText>Code Stury 문제 등록 업데이트</ItemText>
              <ItemDate>2026.1.20</ItemDate>
            </PanelItem>
            <PanelItem>
              <ItemText>Code Stury 사이트 이용문의사항</ItemText>
              <ItemDate>2026.1.20</ItemDate>
            </PanelItem>
            <PanelItem>
              <ItemText>Code Stury 문제 제출 기능 업데이트</ItemText>
              <ItemDate>2026.1.20</ItemDate>
            </PanelItem>
          </PanelList>
        </ContentPanel>
      </MainContent>

      <Footer />
    </IndexContainer>
  );
};

// Styled Components
const IndexContainer = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const HeroAndTabSection = styled.section`
  position: relative;
  width: 100%;
  overflow: hidden;
  min-height: 460px; /* HeroSection 400px + TabNavigation 약 60px */
`;

const HeroSection = styled.section`
  position: relative;
  width: 100%;
  height: 400px;
  z-index: 1;
`;

const HeroContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 150px 80px 60px 80px;
`;

const HeroBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100%;
  min-height: 460px;
  z-index: 0;
  overflow: hidden;
  margin-left: calc(-50vw + 50%);
  
  > div {
    width: 100% !important;
    height: 100% !important;
  }
  
  canvas {
    width: 100% !important;
    height: 100% !important;
    display: block;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 600px;
`;

const HeroTitle = styled.h1`
  font-size: 48px;
  font-weight: bold;
  color: white;
  margin: 0 0 20px 0;
  line-height: 1.2;
`;

const HeroDescription = styled.p`
  font-size: 16px;
  color: white;
  line-height: 1.6;
  margin: 0;
  opacity: 0.95;
`;

const HeroButton = styled.button`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  margin-top: 40px;
  background: rgba(75, 85, 99, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(55, 65, 81, 0.7);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.3);
  }

  svg {
    font-size: 18px;
  }
`;

const TabNavigation = styled.nav`
  position: relative;
  width: 100%;
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 1;
  display: flex;
`;

const Tab = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  background: ${props => props.active 
    ? 'rgba(255, 255, 255, 0.25)' 
    : 'rgba(255, 255, 255, 0.1)'};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: white;
  border: 1px solid ${props => props.active 
    ? 'rgba(255, 255, 255, 0.3)' 
    : 'rgba(255, 255, 255, 0.2)'};
  border-bottom: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.active 
    ? '0 4px 6px rgba(0, 0, 0, 0.1)' 
    : 'none'};

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }

  svg {
    font-size: 18px;
  }
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 40px;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const ContentPanel = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
`;

const PanelTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
`;

const PanelActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;

  &:hover {
    background: #e5e7eb;
    color: #1f2937;
  }

  svg {
    font-size: 14px;
  }
`;

const PanelList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const PanelItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }
`;

const ItemText = styled.span`
  font-size: 14px;
  color: #1f2937;
  flex: 1;
`;

const ItemDate = styled.span`
  font-size: 14px;
  color: #9ca3af;
  margin-left: 16px;
`;

export default IndexPage;
