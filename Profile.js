import React, { useState } from 'react';
import axios from 'axios';

const Profile = ({ user, setUser }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    avatar: user.avatar || '',
    bio: user.bio || ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.put(`/api/users/profile/${user.id}`, formData);
      setUser(response.data.user);
      setSuccess('Profile updated successfully!');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '40px auto' }}>
      <h2 style={{ marginBottom: '30px' }}>My Profile</h2>
      
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        {formData.avatar ? (
          <img 
            src={formData.avatar} 
            alt="Avatar" 
            style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              objectFit: 'cover',
              border: '3px solid #ddd'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            fontSize: '40px',
            color: '#666'
          }}>
            👤
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            className="form-control"
            value={user.email}
            disabled
            style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
          />
          <small style={{ color: '#666', fontSize: '12px' }}>
            Email address cannot be changed
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="avatar">Avatar URL</label>
          <input
            type="url"
            id="avatar"
            name="avatar"
            className="form-control"
            value={formData.avatar}
            onChange={handleChange}
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            className="form-control"
            value={formData.bio}
            onChange={handleChange}
            rows="4"
            placeholder="Tell us about yourself..."
          />
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <button 
          type="submit" 
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '20px' }}
          disabled={loading}
        >
          {loading ? 'Updating Profile...' : 'Update Profile'}
        </button>
      </form>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Account Information:</h4>
        <div style={{ fontSize: '12px', color: '#666' }}>
          <div>Member since: {new Date(user.createdAt || Date.now()).toLocaleDateString()}</div>
          <div>User ID: {user.id}</div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
