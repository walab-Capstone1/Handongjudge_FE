import React, { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import WeekCard from "../../components/WeekCard";
import "./AssignmentListPage.css";

const AssignmentListPage = () => {
  const [selectedFilter, setSelectedFilter] = useState("frequency");

  const weeks = [
    {
      id: 1,
      title: "week 1",
      description: "Key-value쌍으로 데이터를 빠르게 찾아보세요.",
      frequency: "높음",
      avgScore: "보통",
      problemSet: "4/5"
    },
    {
      id: 2,
      title: "week 2",
      description: "LIFO, FIFO, push & pop! 스택과 큐를 이용해서 문제를 풀어보세요.",
      frequency: "보통",
      avgScore: "높음",
      problemSet: "0/6"
    },
    {
      id: 3,
      title: "week 3",
      description: "힙은 특정한 규칙을 가지는 트리로, 힙을 이용해서 우선순위 큐를 구현할 수 있습니다.",
      frequency: "보통",
      avgScore: "높음",
      problemSet: "0/3"
    },
    {
      id: 4,
      title: "week 4",
      description: "정렬을 이용해서 문제를 효율적으로 풀어보세요.",
      frequency: "높음",
      avgScore: "높음",
      problemSet: "0/3"
    },
    {
      id: 5,
      title: "week 5",
      description: "무식해 보여도 사실은 최고의 방법일 때가 있지요.",
      frequency: "높음",
      avgScore: "낮음",
      problemSet: "0/7"
    },
    {
      id: 6,
      title: "week 6",
      description: "부분적인 최적해가 전체적인 최적해가 되는 마법!",
      frequency: "낮음",
      avgScore: "낮음",
      problemSet: "0/6"
    },
    {
      id: 7,
      title: "week 6",
      description: "불필요한 계산을 줄이고, 효율적으로 최적해를 찾아야만 풀리는 문제들입니다.",
      frequency: "낮음",
      avgScore: "낮음",
      problemSet: "0/5"
    },
    {
      id: 8,
      title: "week 7",
      description: "깊이/너비 우선 탐색을 사용해 원하는 답을 찾아보세요.",
      frequency: "높음",
      avgScore: "낮음",
      problemSet: "0/7"
    },
    {
      id: 9,
      title: "midterm",
      description: "이분탐색 기념을 이용해 효율적으로 값을 찾아보세요",
      frequency: "낮음",
      avgScore: "낮음",
      problemSet: "0/2"
    },
    {
      id: 10,
      title: "week 9",
      description: "엣지를 지나 그래프의 노드를 탐험해봅시다.",
      frequency: "낮음",
      avgScore: "낮음",
      problemSet: "1/3"
    }
  ];

  return (
    <MainLayout>
      <div className="assignment-list-page">
        <div className="page-header">
          <h1 className="page-title">수업 선택 페이지(AssignmentListPage)</h1>
        </div>
        
        <div className="content-area">
          <div className="class-info">
            <div className="class-details">
              <h2 className="class-title">A Class (section 2)</h2>
              <p className="class-description">
                class descriptions class descriptions class descriptions class descriptions class descriptions
              </p>
            </div>
            <div className="class-icon">📚</div>
          </div>
          
          <div className="weeks-grid">
            {weeks.map((week) => (
              <WeekCard key={week.id} week={week} />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AssignmentListPage; 