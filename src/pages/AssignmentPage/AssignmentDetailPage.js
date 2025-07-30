import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import ProblemItem from "../../components/ProblemItem";
import "./AssignmentDetailPage.css";

const AssignmentDetailPage = () => {
  const { week } = useParams();
  const [selectedFilter, setSelectedFilter] = useState("frequency");

  const problems = [
    {
      id: 1,
      title: "완주하지 못한 선수",
      level: "Level 1",
      completed: "105,930명 완료",
      language: "JS"
    },
    {
      id: 2,
      title: "N Queens",
      level: "Level 1",
      completed: "64,739명 완료",
      language: "JS"
    },
    {
      id: 3,
      title: "전화번호 목록",
      level: "Level 2",
      completed: "71,358명 완료",
      language: "JS"
    },
    {
      id: 4,
      title: "의상",
      level: "Level 2",
      completed: "65,437명 완료",
      language: "JS",
      tags: ["해시", "조합", "수학"]
    },
    {
      id: 5,
      title: "베스트앨범",
      level: "Level 3",
      completed: "42,080명 완료",
      language: "JS",
      tags: ["해시", "정렬", "구현"]
    }
  ];

  const weekDescriptions = {
    "1": "Key-value쌍으로 데이터를 빠르게 찾아보세요.",
    "2": "LIFO, FIFO, push & pop! 스택과 큐를 이용해서 문제를 풀어보세요.",
    "3": "힙은 특정한 규칙을 가지는 트리로, 힙을 이용해서 우선순위 큐를 구현할 수 있습니다.",
    "4": "정렬을 이용해서 문제를 효율적으로 풀어보세요.",
    "5": "무식해 보여도 사실은 최고의 방법일 때가 있지요.",
    "6": "부분적인 최적해가 전체적인 최적해가 되는 마법!",
    "7": "깊이/너비 우선 탐색을 사용해 원하는 답을 찾아보세요.",
    "midterm": "이분탐색 기념을 이용해 효율적으로 값을 찾아보세요",
    "9": "엣지를 지나 그래프의 노드를 탐험해봅시다."
  };

  return (
    <MainLayout>
      <div className="assignment-detail-page">
        <div className="page-header">
          <h1 className="page-title">과제 리스트 페이지 (AssignmentDetailPage)</h1>
        </div>
        
        <div className="content-area">
          <div className="week-header">
            <div className="week-info">
              <h2 className="week-title">Week {week}</h2>
              <p className="week-description">
                {weekDescriptions[week] || "해당 주차의 문제들을 풀어보세요."}
              </p>
            </div>
            <Link to="/mypage/info" className="profile-avatar">
              <div className="avatar-icon">🐦</div>
            </Link>
          </div>
          
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${selectedFilter === "frequency" ? "active" : ""}`}
              onClick={() => setSelectedFilter("frequency")}
            >
              출제빈도 높을
            </button>
            <button 
              className={`filter-tab ${selectedFilter === "score" ? "active" : ""}`}
              onClick={() => setSelectedFilter("score")}
            >
              평균 점수 모듬
            </button>
          </div>
          
          <div className="problems-list">
            {problems.map((problem) => (
              <ProblemItem key={problem.id} problem={problem} week={week} />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AssignmentDetailPage; 