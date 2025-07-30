import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => (
  <nav className="navbar">
    <div className="nav-left">
      <Link to="/main" className="logo-link">HandongJudge</Link>
      <Link to="/main" className="nav-link">Lecture</Link>
      <Link to="/assignments" className="nav-link">Class</Link>
      <Link to="/mypage/info" className="nav-link">My Page</Link>
    </div>
    <div className="nav-right">
      <Link to="/settings" className="settings-button">Settings</Link>
    </div>
  </nav>
);

export default Navbar; 