import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="navbar">
          <h1>ellectro.ma</h1>
          <nav>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/category">Categories</a></li>
              <li><a href="/cart">Cart</a></li>
              <li><a href="/login">Login</a></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
