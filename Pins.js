import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const Pins = ({ user }) => {
  const { boardId } = useParams();
  const [pins, setPins] = useState([]);
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTag, setSearchTag] = useState('');

  useEffect(() => {
    fetchBoardAndPins();
  }, [boardId]);

  const fetchBoardAndPins = async () => {
    try {
      // Fetch board details
      const boardResponse = await axios.get(`/api/boards/${boardId}`);
      setBoard(boardResponse.data.board);

      // Fetch pins for this board
      const pinsResponse = await axios.get(`/api/pins/board/${boardId}`);
      setPins(pinsResponse.data.pins);
    } catch (error) {
      setError('Failed to fetch pins');
      console.error('Error fetching pins:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePin = async (pinId) => {
    if (!window.confirm('Are you sure you want to delete this pin?')) {
      return;
    }

    try {
      await axios.delete(`/api/pins/${pinId}`);
      setPins(pins.filter(pin => pin._id !== pinId));
    } catch (error) {
      setError('Failed to delete pin');
      console.error('Error deleting pin:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchTag.trim()) {
      fetchBoardAndPins();
      return;
    }

    try {
      const response = await axios.get(`/api/pins/board/${boardId}?tag=${searchTag}`);
      setPins(response.data.pins);
    } catch (error) {
      setError('Failed to search pins');
      console.error('Error searching pins:', error);
    }
  };

  const clearSearch = () => {
    setSearchTag('');
    fetchBoardAndPins();
  };

  const getPinIcon = (type) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'link': return '🔗';
      case 'repo': return '📁';
      case 'pdf': return '📄';
      case 'youtube': return '📺';
      default: return '📌';
    }
  };

  if (loading) {
    return <div className="loading">Loading pins...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1>{board?.title || 'Board'}</h1>
            {board?.description && <p style={{ color: '#666', margin: '5px 0 0 0' }}>{board.description}</p>}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/boards" className="btn btn-secondary">
              Back to Boards
            </Link>
            <Link to={`/boards/${boardId}/add-pin`} className="btn btn-primary">
              Add Pin
            </Link>
          </div>
        </div>

        <div className="search-bar">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search by tag..."
              className="search-input"
              value={searchTag}
              onChange={(e) => setSearchTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="btn btn-primary">
              Search
            </button>
            {searchTag && (
              <button onClick={clearSearch} className="btn btn-secondary">
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {error && <div className="error" style={{ marginBottom: '20px' }}>{error}</div>}

      {pins.length === 0 ? (
        <div className="empty-state">
          <h3>{searchTag ? 'No pins found' : 'No pins yet'}</h3>
          <p>
            {searchTag 
              ? `No pins found with tag "${searchTag}"`
              : 'Start adding pins to organize your knowledge!'
            }
          </p>
          {!searchTag && (
            <Link to={`/boards/${boardId}/add-pin`} className="btn btn-primary">
              Add Your First Pin
            </Link>
          )}
        </div>
      ) : (
        <div className="pinterest-grid">
          {pins.map(pin => (
            <div key={pin._id} className="pinterest-pin">
              {/* Image preview for image pins */}
              {pin.type === 'image' && (
                <div className="pin-image-container">
                  <img 
                    src={pin.contentUrl} 
                    alt={pin.title}
                    className="pin-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="pin-image-fallback" style={{ display: 'none' }}>
                    <span style={{ fontSize: '48px' }}>🖼️</span>
                    <p>Image not available</p>
                  </div>
                  <div className="pin-overlay">
                    <a 
                      href={pin.contentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="pin-view-btn"
                    >
                      View
                    </a>
                    {pin.createdBy._id === user.id && (
                      <button
                        onClick={() => deletePin(pin._id)}
                        className="pin-delete-btn"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Content preview for non-image pins */}
              {pin.type !== 'image' && (
                <div className="pin-content-preview">
                  <div className="pin-type-icon">
                    <span style={{ fontSize: '48px' }}>{getPinIcon(pin.type)}</span>
                  </div>
                  <div className="pin-overlay">
                    <a 
                      href={pin.contentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="pin-view-btn"
                    >
                      Open
                    </a>
                    {pin.createdBy._id === user.id && (
                      <button
                        onClick={() => deletePin(pin._id)}
                        className="pin-delete-btn"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Pin info */}
              <div className="pin-info">
                <h3 className="pin-title">{pin.title}</h3>
                
                {pin.tags.length > 0 && (
                  <div className="pin-tags">
                    {pin.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                    {pin.tags.length > 3 && <span className="tag">+{pin.tags.length - 3}</span>}
                  </div>
                )}

                <div className="pin-meta">
                  <div className="pin-author">
                    <span>📌 {pin.createdBy.name}</span>
                  </div>
                  <div className="pin-date">
                    {new Date(pin.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Pins;
