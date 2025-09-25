import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Boards from './components/Boards';
import Pins from './components/Pins';
import AddBoard from './components/AddBoard';
import AddPin from './components/AddPin';
import Profile from './components/Profile';

// Configure axios defaults
axios.defaults.withCredentials = true;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/users/auth/check');
      if (response.data.authenticated) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/users/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <h3>Loading...</h3>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="container">
          <Routes>
            <Route 
              path="/login" 
              element={
                user ? <Navigate to="/boards" /> : <Login onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/register" 
              element={
                user ? <Navigate to="/boards" /> : <Register onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/boards" 
              element={
                user ? <Boards user={user} /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/boards/:boardId/pins" 
              element={
                user ? <Pins user={user} /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/add-board" 
              element={
                user ? <AddBoard user={user} /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/boards/:boardId/add-pin" 
              element={
                user ? <AddPin user={user} /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/profile" 
              element={
                user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/" 
              element={
                user ? <Navigate to="/boards" /> : <Navigate to="/login" />
              } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
