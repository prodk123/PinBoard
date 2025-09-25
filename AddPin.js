import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const AddPin = ({ user }) => {
  const { boardId } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    type: 'link',
    contentUrl: '',
    tags: ''
  });
  const [useFile, setUseFile] = useState(false); // toggle for image/pdf
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFormData({ ...formData, type: newType });
    // Reset upload mode when switching type
    if (newType !== 'image' && newType !== 'pdf') {
      setUseFile(false);
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // If uploading file for image/pdf
      if (useFile && (formData.type === 'image' || formData.type === 'pdf')) {
        if (!file) {
          setError('Please select a file to upload');
          setLoading(false);
          return;
        }
        const fd = new FormData();
        fd.append('file', file);
        fd.append('boardId', boardId);
        fd.append('title', formData.title);
        if (tagsArray.length > 0) fd.append('tags', tagsArray.join(','));

        await axios.post('/api/pins/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Fallback to URL-based creation
        await axios.post('/api/pins', {
          boardId,
          title: formData.title,
          type: formData.type,
          contentUrl: formData.contentUrl,
          tags: tagsArray
        });
      }

      navigate(`/boards/${boardId}/pins`);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create pin');
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholderUrl = (type) => {
    switch (type) {
      case 'image':
        return 'https://example.com/image.jpg';
      case 'link':
        return 'https://example.com/article';
      case 'repo':
        return 'https://github.com/username/repository';
      case 'pdf':
        return 'https://example.com/document.pdf';
      case 'youtube':
        return 'https://www.youtube.com/watch?v=example';
      default:
        return 'https://example.com';
    }
  };

  return (
    <div className="pinterest-form-container">
      <div className="pinterest-form-card">
        <h2 className="form-title">Create Pin</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Pin Title</label>
          <input
            type="text"
            id="title"
            name="title"
            className="form-control"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter a descriptive title for your pin..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">Content Type</label>
          <select
            id="type"
            name="type"
            className="form-control"
            value={formData.type}
            onChange={handleTypeChange}
            required
          >
            <option value="link">🔗 Link</option>
            <option value="image">🖼️ Image</option>
            <option value="repo">📁 Repository</option>
            <option value="pdf">📄 PDF Document</option>
            <option value="youtube">📺 YouTube Video</option>
          </select>
        </div>

        {(formData.type === 'image' || formData.type === 'pdf') && (
          <div className="form-group">
            <label>Input Method</label>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="radio"
                  name="inputMethod"
                  checked={!useFile}
                  onChange={() => setUseFile(false)}
                />
                Use URL
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="radio"
                  name="inputMethod"
                  checked={useFile}
                  onChange={() => setUseFile(true)}
                />
                Upload File
              </label>
            </div>
          </div>
        )}

        {/* URL input when not using file OR for types that only support URL */}
        {(!useFile || !['image', 'pdf'].includes(formData.type)) && (
          <div className="form-group">
            <label htmlFor="contentUrl">Content URL</label>
            <input
              type="url"
              id="contentUrl"
              name="contentUrl"
              className="form-control"
              value={formData.contentUrl}
              onChange={handleChange}
              required={!useFile}
              placeholder={getPlaceholderUrl(formData.type)}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              Enter the full URL to your content
            </small>
          </div>
        )}

        {/* File input when using file for image/pdf */}
        {useFile && ['image', 'pdf'].includes(formData.type) && (
          <div className="form-group">
            <label htmlFor="file">Select {formData.type.toUpperCase()} File</label>
            <input
              type="file"
              id="file"
              name="file"
              className="form-control"
              accept={formData.type === 'image' ? 'image/*' : 'application/pdf'}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required={useFile}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              Maximum size 10MB. Supported: {formData.type === 'image' ? 'images' : 'PDF'}
            </small>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="tags">Tags (optional)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            className="form-control"
            value={formData.tags}
            onChange={handleChange}
            placeholder="javascript, react, tutorial, web-development"
          />
          <small style={{ color: '#666', fontSize: '12px' }}>
            Enter tags separated by commas to help organize and search your pins
          </small>
        </div>

        {error && <div className="error">{error}</div>}

        <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Adding Pin...' : 'Add Pin'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate(`/boards/${boardId}/pins`)}
          >
            Cancel
          </button>
        </div>
      </form>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Supported Content Types:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#666' }}>
          <li><strong>Link:</strong> Any web page or article</li>
          <li><strong>Image:</strong> Direct links to images (jpg, png, gif, etc.)</li>
          <li><strong>Repository:</strong> GitHub, GitLab, or other code repositories</li>
          <li><strong>PDF:</strong> Direct links to PDF documents</li>
          <li><strong>YouTube:</strong> YouTube video links</li>
        </ul>
      </div>
      </div>
    </div>
  );
};

export default AddPin;
