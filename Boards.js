import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Boards = ({ user }) => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await axios.get('/api/boards');
      setBoards(response.data.boards);
    } catch (error) {
      setError('Failed to fetch boards');
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBoard = async (boardId) => {
    if (!window.confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/boards/${boardId}`);
      setBoards(boards.filter(board => board._id !== boardId));
    } catch (error) {
      setError('Failed to delete board');
      console.error('Error deleting board:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading boards...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>My Boards</h1>
        <Link to="/add-board" className="btn btn-primary">
          Create New Board
        </Link>
      </div>

      {error && <div className="error" style={{ marginBottom: '20px' }}>{error}</div>}

      {boards.length === 0 ? (
        <div className="empty-state">
          <h3>No boards yet</h3>
          <p>Create your first board to start organizing your knowledge pins!</p>
          <Link to="/add-board" className="btn btn-primary">
            Create Your First Board
          </Link>
        </div>
      ) : (
        <div className="boards-grid">
          {boards.map(board => (
            <div key={board._id} className="board-card">
              <div className="board-preview">
                <div className="board-preview-grid">
                  <div className="preview-cell"></div>
                  <div className="preview-cell"></div>
                  <div className="preview-cell"></div>
                  <div className="preview-cell"></div>
                </div>
                <div className="board-overlay">
                  <Link 
                    to={`/boards/${board._id}/pins`} 
                    className="board-view-btn"
                  >
                    View Board
                  </Link>
                  {board.createdBy._id === user.id && (
                    <button
                      onClick={() => deleteBoard(board._id)}
                      className="board-delete-btn"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              
              <div className="board-info">
                <h3 className="board-title">{board.title}</h3>
                
                {board.description && (
                  <p className="board-description">{board.description}</p>
                )}
                
                <div className="board-meta">
                  <div className="board-author">
                    <span>👤 {board.createdBy.name}</span>
                  </div>
                  {board.collaborators.length > 0 && (
                    <div className="board-collaborators">
                      <span>👥 {board.collaborators.length} collaborator{board.collaborators.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
                
                <div className="board-actions">
                  <Link 
                    to={`/boards/${board._id}/add-pin`} 
                    className="btn btn-primary btn-sm"
                  >
                    Add Pin
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Boards;
