import React from 'react';
import logo from '../assets/logo.png';
import '../styles/Header.css';



function Header() {
  return (
    <div className="header-container" role="banner">
        <div className="header">
            <img src={logo} alt="Logo" />
            <h1>Crime Chronicles</h1>
        </div>
</div>

  );
}



export default Header;
