import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { publishVideo } from '../services/api';

const videoCategories = [
  "📚 Education",
  "🎮 Gaming",
  "🎵 Music",
  "🤳 Vlogs",
  "💻 Tech",
  "🍿 Entertainment",
  "📰 News",
  "⚽ Sports",
  "😂 Comedy",
  "💄 Beauty & Fashion"
];

const PublishVideoPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(videoCategories[0]);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!title.trim() || !description.trim() || !category || !videoFile || !thumbnail) {
      setError('All fields are required.');
      return;
    }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('videoFile', videoFile);
    formData.append('thumbnail', thumbnail);
    setLoading(true);
    try {
      await publishVideo(formData);
      setSuccess('Video published successfully!');
      setTimeout(() => navigate('/homepage'), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to publish video.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 600 }}>
      <h2 className="mb-4">Publish Video</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="title">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="description">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="category">
          <Form.Label>Category</Form.Label>
          <Form.Select
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
          >
            {videoCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3" controlId="videoFile">
          <Form.Label>Video File</Form.Label>
          <Form.Control
            type="file"
            accept="video/*"
            onChange={e => setVideoFile(e.target.files[0])}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="thumbnail">
          <Form.Label>Thumbnail</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={e => setThumbnail(e.target.files[0])}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Publishing...' : 'Publish Video'}
        </Button>
      </Form>
    </div>
  );
};

export default PublishVideoPage; 