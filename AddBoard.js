import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddBoard = ({ user }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    collaborators: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const collaboratorEmails = formData.collaborators
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      const response = await axios.post('/api/boards', {
        title: formData.title,
        description: formData.description,
        collaborators: collaboratorEmails
      });

      navigate('/boards');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create board');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '60px auto' }}>
      <h2 style={{ marginBottom: '30px' }}>Create New Board</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Board Title</label>
          <input
            type="text"
            id="title"
            name="title"
            className="form-control"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter board title..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (optional)</label>
          <textarea
            id="description"
            name="description"
            className="form-control"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Describe what this board is for..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="collaborators">Collaborators (optional)</label>
          <input
            type="text"
            id="collaborators"
            name="collaborators"
            className="form-control"
            value={formData.collaborators}
            onChange={handleChange}
            placeholder="Enter email addresses separated by commas..."
          />
          <small style={{ color: '#666', fontSize: '12px' }}>
            Enter email addresses of users you want to collaborate with, separated by commas
          </small>
        </div>

        {error && <div className="error">{error}</div>}

        <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating Board...' : 'Create Board'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/boards')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBoard;
