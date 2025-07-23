import React from "react";

const MainLayout = ({ children }) => (
  <>
    {/* TODO: Navbar 컴포넌트 연결 */}
    <header style={{padding: '1rem', borderBottom: '1px solid #eee'}}>Main Navigation</header>
    <main style={{padding: '2rem'}}>{children}</main>
    {/* TODO: Footer 등 추가 가능 */}
  </>
);

export default MainLayout; 