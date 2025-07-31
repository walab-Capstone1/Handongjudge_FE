import React from "react";
import Navbar from "../components/Navbar";
import "./MainLayout.css";

const MainLayout = ({ children }) => (
  <div className="main-layout">
    <Navbar />
    <main className="main-content">{children}</main>
  </div>
);

export default MainLayout; 