import React from "react";
import Navbar from "../components/Navbar";

const MainLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
  </>
);

export default MainLayout; 