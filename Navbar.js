import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="pinterest-navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            <span className="logo-icon">P</span>
            <span className="logo-text">PinBoard</span>
          </Link>
          
          {user && (
            <div className="navbar-nav-left">
              <Link to="/boards" className="nav-btn nav-btn-primary">
                <span>🏠</span> Home
              </Link>
              <Link to="/add-board" className="nav-btn">
                <span>➕</span> Create
              </Link>
            </div>
          )}
        </div>
        
        <div className="navbar-right">
          {user ? (
            <div className="navbar-nav-right">
              <Link to="/profile" className="nav-profile">
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="nav-avatar" />
                ) : (
                  <div className="nav-avatar-placeholder">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="nav-username">{user.name}</span>
              </Link>
              <button 
                onClick={onLogout} 
                className="nav-btn nav-btn-logout"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar-nav-right">
              <Link to="/login" className="nav-btn">Login</Link>
              <Link to="/register" className="nav-btn nav-btn-primary">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
