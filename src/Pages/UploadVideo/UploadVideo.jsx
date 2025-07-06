import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UploadVideo.css';
import {
  useToast
} from '../../index';
import API_BASE_URL from '../../config/api';
import { Sidebar } from '../../Components/Sidebar/Sidebar'

function UploadVideo() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Anime'
  });
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const categories = [
    'Anime',
    'Thriller',
    'Crime',
    'Super Hero',
    'Medieval Fantasy'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const validTypes = ['video/mp4', 'video/mkv', 'video/avi', 'video/mov'];
      if (!validTypes.includes(file.type)) {
        showToast('error', '', 'Please select a valid video file (MP4, MKV, AVI, MOV)');
        return;
      }
      
      // Check file size (max 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        showToast('error', '', 'File size must be less than 100MB');
        return;
      }

      setVideoFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('error', '', 'Please log in to upload videos');
      navigate('/login');
      return;
    }

    // Validate form
    if (!formData.title.trim()) {
      showToast('error', '', 'Please enter a video title');
      return;
    }

    if (!videoFile) {
      showToast('error', '', 'Please select a video file');
      return;
    }

    try {
      setUploading(true);

      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append('video', videoFile);
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('category', formData.category);

      const response = await axios.post(
        `${API_BASE_URL}/api/upload-video`,
        uploadData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.message) {
        showToast('success', '', 'Video uploaded successfully!');
        // Reset form
        setFormData({
          title: '',
          description: '',
          category: 'Anime'
        });
        setVideoFile(null);
        setPreviewUrl('');
        // Navigate to home page
        navigate('/');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to upload video';
      showToast('error', '', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className='upload-video-page-container'>
      <Sidebar />
      <div className='upload-video-main'>
        <div className='upload-video-content'>
          <h1 className='upload-video-title'>Upload Video</h1>
          <form onSubmit={handleSubmit} className='upload-video-form'>
            <div className='form-group'>
              <label htmlFor='title'>Video Title *</label>
              <input
                type='text'
                id='title'
                name='title'
                value={formData.title}
                onChange={handleInputChange}
                placeholder='Enter video title'
                required
                className='form-input'
              />
            </div>
            <div className='form-group'>
              <label htmlFor='description'>Description</label>
              <textarea
                id='description'
                name='description'
                value={formData.description}
                onChange={handleInputChange}
                placeholder='Enter video description (optional)'
                rows='4'
                className='form-textarea'
              />
            </div>
            <div className='form-group'>
              <label htmlFor='category'>Category *</label>
              <select
                id='category'
                name='category'
                value={formData.category}
                onChange={handleInputChange}
                className='form-select'
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className='form-group'>
              <label htmlFor='video'>Video File *</label>
              <input
                type='file'
                id='video'
                accept='video/*'
                onChange={handleFileChange}
                required
                className='form-file-input'
              />
              <p className='file-help-text'>
                Supported formats: MP4, MKV, AVI, MOV (Max size: 100MB)
              </p>
            </div>
            {previewUrl && (
              <div className='video-preview'>
                <h3>Video Preview:</h3>
                <video 
                  controls 
                  className='preview-video'
                  src={previewUrl}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            <button
              type='submit'
              disabled={uploading}
              className='upload-button'
            >
              {uploading ? 'Uploading...' : 'Upload Video'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export { UploadVideo }; 