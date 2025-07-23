import React from "react";

const Navbar = () => (
  <nav style={{display: 'flex', gap: 16, padding: '1rem', background: '#222', color: '#fff'}}>
    <span>로고</span>
    <a href="/" style={{color: '#fff'}}>메인</a>
    <a href="/assignments/1" style={{color: '#fff'}}>과제</a>
    <a href="/questions" style={{color: '#fff'}}>질문</a>
    <a href="/notices" style={{color: '#fff'}}>공지사항</a>
    <a href="/mypage" style={{color: '#fff'}}>마이페이지</a>
  </nav>
);

export default Navbar; 