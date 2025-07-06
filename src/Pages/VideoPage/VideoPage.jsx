/**
 * VideoPage.jsx - Improved hooks order and modern UI
 */
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import ReactPlayer from 'react-player';
import {
  AiFillLike, AiOutlineLike, AiFillDislike, AiOutlineDislike
} from 'react-icons/ai';
import {
  MdAccessTime, MdPlaylistAdd, MdEdit, MdDelete, MdMoreVert
} from 'react-icons/md';
import './VideoPage.css';
import {
  RecommendationCard,
  AddToPlaylistModal,
  useTrendingVideos,
  useLikedVideos,
  useDislikedVideos,
  useWatchLater,
  useToast,
  useHistory,
  getRelativeTime,
  useAllVideos
} from '../../index';
import API_BASE_URL from '../../config/api';
import CustomVideoPlayer from '../CustomVideoPlayer';


function VideoPage() {
  // All hooks at the top
  const { dislikedVideosList, dispatchDislikedVideosList } = useDislikedVideos();
  const { likedVideosList, dispatchLikedVideosList } = useLikedVideos();
  const { watchLaterList, dispatchWatchLaterList } = useWatchLater();
  const { showToast } = useToast();
  const { userHistoryList, setUserHistoryList } = useHistory();
  const { trendingVideosList, updateTrendingVideoViews } = useTrendingVideos();
  const { updateAllVideosViews } = useAllVideos();
  const [videoLikedStatus, setVideoLikedStatus] = useState('neutral');
  const [isVideoPresentInWatchLater, setIsVideoPresentInWatchLater] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentError, setCommentError] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [showKebabMenu, setShowKebabMenu] = useState(false);
  
  // Debug useEffect to monitor state changes
  useEffect(() => {
    console.log('=== STATE CHANGE === Video liked status changed to:', videoLikedStatus);
    console.trace('State change stack trace');
  }, [videoLikedStatus]);
  
  // Function to refresh all video states from backend
  const refreshVideoStates = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      console.log('Refreshing video states from backend...');
      
      // Check if video is liked
      const likeResponse = await axios.get(
        `${API_BASE_URL}/api/likedvideos/${video._id}/check`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Check if video is disliked
      const dislikeResponse = await axios.get(
        `${API_BASE_URL}/api/dislikedvideos/${video._id}/check`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Check if video is in watch later
      const watchLaterResponse = await axios.get(
        `${API_BASE_URL}/api/watchlater`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const isInWatchLater = watchLaterResponse.data.watchLater.some(
        (watchLaterVideo) => watchLaterVideo._id === video._id
      );
      
      // Set states based on backend response
      if (likeResponse.data.isLiked) {
        setVideoLikedStatus('liked');
      } else if (dislikeResponse.data.isDisliked) {
        setVideoLikedStatus('disliked');
      } else {
        setVideoLikedStatus('neutral');
      }
      
      setIsVideoPresentInWatchLater(isInWatchLater);
      
      console.log('Video states refreshed:', {
        isLiked: likeResponse.data.isLiked,
        isDisliked: dislikeResponse.data.isDisliked,
        inWatchLater: isInWatchLater
      });
      
    } catch (error) {
      console.error('Error refreshing video states:', error);
    }
  };
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { id: videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [error, setError] = useState(null);

  const { state } = useLocation();
  console.log('this is video data',state)

  window.YTConfig = { host: 'https://www.youtube.com' };
  const navigate = useNavigate();

  // Safety check for state and video details
  const videoNotFound = !video;

  // Safety checks for video data
  const safeTitle = video?.title || 'Untitled Video';
  const safeViews = video?.views || 0;
  const safeVideoSrcUrl = video?.videoSrcUrl || '';
  const safeUploader = video?.uploader || 'Unknown';
  const safeCategory = video?.category || '';
  const safeDescription = video?.description || '';

  let videoViews;
  if (safeViews > 1000000) {
    videoViews = (safeViews / 1000000).toFixed(1) + 'M';
  } else if (safeViews > 1000) {
    videoViews = (safeViews / 1000).toFixed(1) + 'K';
  } else {
    videoViews = safeViews + '';
  }

  let videoCode;
  if (safeVideoSrcUrl && safeVideoSrcUrl.includes('v=')) {
    try {
      videoCode = safeVideoSrcUrl.split('v=')[1]?.split('&')[0];
    } catch (error) {
      console.error('Error parsing video URL:', error);
      videoCode = null;
    }
  }

  const opts = {
    playerVars: {
      autoplay: 1,
      rel: 0,
      showinfo: 0,
      modestbranding: 1,
      iv_load_policy: 3,
      rel: 0,
      disablekb: 1,
      fs: 0,
      hl: 'en',
      cc_load_policy: 0,
      vq: 'medium',
    },
    width: '100%',
    height: '100%',
  };

  // YouTube player event handlers
  const onReady = (event) => {
    // Player is ready
    // event.target.playVideo();
  };
  const onError = (event) => {
    // Handle player errors gracefully
    console.log('YouTube player error:', event.data);
  };
  const onStateChange = (event) => {
    // Handle player state changes
    // console.log('YouTube player state changed:', event.data);
  };

  // Effects (always after hooks, never conditionally)
  useEffect(() => {
    if (videoId) {
      axios.get(`${API_BASE_URL}/api/videos/${videoId}`)
        .then(res => {
          setVideo(res.data);
          // Update trending videos context with new view count
          if (updateTrendingVideoViews) {
            updateTrendingVideoViews(res.data._id, res.data.views);
          }
          // Update all videos context with new view count
          if (updateAllVideosViews) {
            updateAllVideosViews(res.data._id, res.data.views);
          }
        })
        .catch(err => setError("Video not found"));
    }
  }, [videoId]);

  useEffect(() => {
    if (videoNotFound) return;
    
    // Check current status from backend
    const checkVideoStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        // Check if video is liked
        const likeResponse = await axios.get(
          `${API_BASE_URL}/api/likedvideos/${video._id}/check`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Check if video is disliked
        const dislikeResponse = await axios.get(
          `${API_BASE_URL}/api/dislikedvideos/${video._id}/check`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Check if video is in watch later from backend
        const watchLaterResponse = await axios.get(
          `${API_BASE_URL}/api/watchlater`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const isInWatchLater = watchLaterResponse.data.watchLater.some(
          (watchLaterVideo) => watchLaterVideo._id === video._id
        );
        setIsVideoPresentInWatchLater(isInWatchLater);
        
        // Set like/dislike status based on backend response (mutually exclusive)
        if (likeResponse.data.isLiked) {
          setVideoLikedStatus('liked');
        } else if (dislikeResponse.data.isDisliked) {
          setVideoLikedStatus('disliked');
        } else {
          setVideoLikedStatus('neutral');
        }
        
        // Log any inconsistencies and fix them
        if (likeResponse.data.isLiked && dislikeResponse.data.isDisliked) {
          console.warn('Video is both liked and disliked - fixing inconsistency...');
          // Fix the inconsistency by removing from disliked (like takes precedence)
          try {
            const fixResponse = await axios.delete(
              `${API_BASE_URL}/api/dislikedvideos/${video._id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (fixResponse.data.success) {
              console.log('Fixed inconsistency - removed from disliked videos');
              setVideoLikedStatus('liked');
            }
          } catch (error) {
            console.error('Error fixing inconsistency:', error);
          }
        }
        
        console.log('Video status from backend:', {
          isLiked: likeResponse.data.isLiked,
          isDisliked: dislikeResponse.data.isDisliked,
          inWatchLater: isInWatchLater
        });
        
      } catch (error) {
        console.error('Error checking video status:', error);
        // Fallback to local state if backend check fails
    const watchLaterIndex = watchLaterList.findIndex((videoDetails) => videoDetails._id === video._id);
    setIsVideoPresentInWatchLater(watchLaterIndex !== -1);
    const likedVideoIndex = likedVideosList.findIndex((videoDetails) => videoDetails._id === video._id);
    if (likedVideoIndex !== -1) {
      setVideoLikedStatus('liked');
    } else {
      const dislikedVideoIndex = dislikedVideosList.findIndex((videoDetails) => videoDetails._id === video._id);
      if (dislikedVideoIndex !== -1) {
        setVideoLikedStatus('disliked');
      } else {
        setVideoLikedStatus('neutral');
      }
    }
      }
    };
    
    checkVideoStatus();
    (async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const user = jwt_decode(token);
        if (user) {
          const updatedUserInfo = await axios.post(
            `${API_BASE_URL}/api/history`,
            { videoId: video._id },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
          if (updatedUserInfo.data.success) {
            setUserHistoryList(updatedUserInfo.data.history);
          }
        }
      }
    })();
  }, [likedVideosList, video?._id, watchLaterList, videoNotFound]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [state]);

  // Fetch comments when video loads
  useEffect(() => {
    if (!videoId) return;
    setCommentsLoading(true);
    axios.get(`${API_BASE_URL}/api/videos/${videoId}/comments`)
      .then(res => {
        setComments(res.data.comments || []);
        setCommentsLoading(false);
      })
      .catch(err => {
        setCommentError('Failed to load comments');
        setCommentsLoading(false);
      });
  }, [videoId]);

  // Get current user info
  let currentUser = null;
  try {
    const token = localStorage.getItem('token');
    if (token) {
      currentUser = jwt_decode(token);
    }
  } catch {}

  // Early return for missing video (after all hooks)
  if (error) return <div>{error}</div>;
  if (!video) return <div>Loading...</div>;

  // --- Handler Functions ---
  const handleLike = async () => {
    const token = localStorage.getItem('token');
    console.log('Token:', token ? 'Present' : 'Missing');
    
    if (token) {
      const user = jwt_decode(token);
      console.log('User from token:', user);
      
      if (!user) {
        localStorage.removeItem('token');
        showToast('warning', '', 'Kindly Login');
        navigate('/login');
        return;
      }
      
      try {
        console.log('Current video liked status:', videoLikedStatus);
        console.log('Video ID:', video._id);
        
        if (videoLikedStatus === 'liked') {
          // Remove like
          console.log('Removing like...');
          const response = await axios.delete(
            `${API_BASE_URL}/api/likedvideos/${video._id}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
          console.log('Remove like response:', response.data);
          
          if (response.data.success) {
            dispatchLikedVideosList({ type: 'UPDATE_LIKED_VIDEOS_LIST', payload: response.data.likedVideos });
            setVideoLikedStatus('neutral');
            console.log('State updated to neutral (like removed)');
            showToast('success', '', 'Video like removed');
          }
        } else {
          // Add like - always remove from disliked first if present
          console.log('Adding like...');
          
          // First, remove from disliked videos if present
          if (videoLikedStatus === 'disliked') {
            console.log('Removing from disliked videos first...');
            try {
              const dislikeResponse = await axios.delete(
                `${API_BASE_URL}/api/dislikedvideos/${video._id}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
              );
              console.log('Remove dislike response:', dislikeResponse.data);
              
              if (dislikeResponse.data.success) {
                dispatchDislikedVideosList({ type: 'UPDATE_DISLIKED_VIDEOS_LIST', payload: dislikeResponse.data.dislikedVideos });
                console.log('Successfully removed from disliked videos');
              }
            } catch (error) {
              console.error('Error removing from disliked videos:', error);
              // Even if removal fails, continue with adding to liked
              console.log('Continuing with adding to liked despite removal error');
            }
          }
          
          // Then add to liked videos
          try {
            const response = await axios.post(
            `${API_BASE_URL}/api/likedvideos`,
            { videoId: video._id },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
            console.log('Add like response:', response.data);
            
            if (response.data.success) {
              dispatchLikedVideosList({ type: 'UPDATE_LIKED_VIDEOS_LIST', payload: response.data.likedVideos });
            setVideoLikedStatus('liked');
              console.log('State updated to liked');
              
            let newTitle = safeTitle || 'Video';
            if (newTitle && newTitle.length > 10) {
              newTitle = newTitle.split('').slice(0, 10).join('') + '...';
            }
            let likedVideoMessage = 'Video liked ' + newTitle;
            showToast('success', '', likedVideoMessage);
            }
          } catch (error) {
            console.error('Error adding to liked videos:', error);
            
            // If video is already liked, update the state to reflect this
            if (error.response?.data?.message === 'Video is already in liked videos') {
              console.log('Video is already liked, updating state...');
              setVideoLikedStatus('liked');
              showToast('info', '', 'Video is already liked');
              
              // Refresh the liked videos list to get current state
              try {
                const refreshResponse = await axios.get(
                  `${API_BASE_URL}/api/likedvideos`,
                  { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                if (refreshResponse.data.success) {
                  dispatchLikedVideosList({ type: 'UPDATE_LIKED_VIDEOS_LIST', payload: refreshResponse.data.likedVideos });
                }
              } catch (refreshError) {
                console.error('Error refreshing liked videos:', refreshError);
              }
            } else {
              // For other errors, try to refresh the state from backend
              console.log('Other error occurred, refreshing state from backend...');
              await refreshVideoStates();
              showToast('error', '', `Failed to update like status: ${error.response?.data?.error || error.message}`);
            }
          }
        }
      } catch (error) {
        console.error('Error handling like:', error);
        console.error('Error response:', error.response?.data);
        showToast('error', '', `Failed to update like status: ${error.response?.data?.error || error.message}`);
      }
    } else {
      showToast('warning', '', 'Kindly Login');
    }
  };

  const handleDislike = async () => {
    const token = localStorage.getItem('token');
    console.log('Dislike - Token:', token ? 'Present' : 'Missing');
    
    if (token) {
      const user = jwt_decode(token);
      console.log('Dislike - User from token:', user);
      
      if (!user) {
        localStorage.removeItem('token');
        showToast('warning', '', 'Kindly Login');
        navigate('/login');
        return;
      }
      
      try {
        console.log('Dislike - Current video liked status:', videoLikedStatus);
        console.log('Dislike - Video ID:', video._id);
        
        if (videoLikedStatus === 'disliked') {
          // Remove dislike
          console.log('Removing dislike...');
          const response = await axios.delete(
            `${API_BASE_URL}/api/dislikedvideos/${video._id}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
          console.log('Remove dislike response:', response.data);
          
          if (response.data.success) {
            dispatchDislikedVideosList({ type: 'UPDATE_DISLIKED_VIDEOS_LIST', payload: response.data.dislikedVideos });
            setVideoLikedStatus('neutral');
            console.log('State updated to neutral (dislike removed)');
            showToast('success', '', 'Video dislike removed');
          }
        } else {
          // Add to disliked videos - always remove from liked first if present
          console.log('=== DISLIKE FLOW START ===');
          console.log('Current state before dislike:', videoLikedStatus);
          console.log('Adding dislike...');
          
          // First, remove from liked videos if present
          if (videoLikedStatus === 'liked') {
            console.log('Removing from liked videos first...');
            try {
              const likeResponse = await axios.delete(
                `${API_BASE_URL}/api/likedvideos/${video._id}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
              );
              console.log('Remove like response:', likeResponse.data);
              
              if (likeResponse.data.success) {
                dispatchLikedVideosList({ type: 'UPDATE_LIKED_VIDEOS_LIST', payload: likeResponse.data.likedVideos });
                console.log('Successfully removed from liked videos');
              }
            } catch (error) {
              console.error('Error removing from liked videos:', error);
              // Even if removal fails, continue with adding to disliked
              console.log('Continuing with adding to disliked despite removal error');
            }
          }
          
          // Then add to disliked videos
          try {
            const response = await axios.post(
            `${API_BASE_URL}/api/dislikedvideos`,
            { videoId: video._id },
              { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            console.log('Add dislike response:', response.data);
            
            if (response.data.success) {
              console.log('=== SUCCESS: Adding to disliked videos ===');
              dispatchDislikedVideosList({ type: 'UPDATE_DISLIKED_VIDEOS_LIST', payload: response.data.dislikedVideos });
              console.log('About to set state to disliked...');
            setVideoLikedStatus('disliked');
              setForceUpdate(prev => prev + 1);
              console.log('State set to disliked - should trigger useEffect');
              
              // Check state after a short delay
              setTimeout(() => {
                console.log('=== STATE CHECK AFTER TIMEOUT === Current state:', videoLikedStatus);
              }, 100);
              
            let newTitle = safeTitle || 'Video';
            if (newTitle && newTitle.length > 10) {
              newTitle = newTitle.split('').slice(0, 10).join('') + '...';
            }
            let dislikedVideoMessage = 'Video disliked ' + newTitle;
            showToast('success', '', dislikedVideoMessage);
            }
          } catch (error) {
            console.error('Error adding to disliked videos:', error);
            
            // If video is already disliked, update the state to reflect this
            if (error.response?.data?.message === 'Video is already in disliked videos') {
              console.log('Video is already disliked, updating state...');
              setVideoLikedStatus('disliked');
              showToast('info', '', 'Video is already disliked');
              
              // Refresh the disliked videos list to get current state
              try {
                const refreshResponse = await axios.get(
                  `${API_BASE_URL}/api/dislikedvideos`,
                  { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                if (refreshResponse.data.success) {
                  dispatchDislikedVideosList({ type: 'UPDATE_DISLIKED_VIDEOS_LIST', payload: refreshResponse.data.dislikedVideos });
                }
              } catch (refreshError) {
                console.error('Error refreshing disliked videos:', refreshError);
              }
            } else {
              // For other errors, try to refresh the state from backend
              console.log('Other error occurred, refreshing state from backend...');
              await refreshVideoStates();
              showToast('error', '', `Failed to update dislike status: ${error.response?.data?.error || error.message}`);
            }
          }
        }
      } catch (error) {
        console.error('Error handling dislike:', error);
        console.error('Error response:', error.response?.data);
        showToast('error', '', `Failed to update dislike status: ${error.response?.data?.error || error.message}`);
      }
    } else {
      showToast('warning', '', 'Kindly Login');
    }
  };

  const addItemToWatchLaterList = async () => {
    const token = localStorage.getItem('token');
    console.log('Watch Later - Token:', token ? 'Present' : 'Missing');
    
    if (token) {
      const user = jwt_decode(token);
      console.log('Watch Later - User from token:', user);
      
      if (!user) {
        localStorage.removeItem('token');
        showToast('warning', '', 'Kindly Login');
        navigate('/login');
        return;
      }
      
      try {
        console.log('Watch Later - Video ID:', video._id);
        console.log('Watch Later - Is already in watch later:', isVideoPresentInWatchLater);
        
        if (isVideoPresentInWatchLater) {
          showToast('warning', '', 'Video already present in Watch Later');
          return;
        }
        
        console.log('Adding to watch later...');
        const response = await axios.post(
            `${API_BASE_URL}/api/watchlater`,
            { videoId: video._id },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
        console.log('Add to watch later response:', response.data);
        
        if (response.data.success) {
          console.log('VideoPage - Dispatching watch later update with payload:', response.data.watchLater);
          dispatchWatchLaterList({ type: 'UPDATE_WATCH_LATER_LIST', payload: response.data.watchLater });
            setIsVideoPresentInWatchLater(true);
            showToast('success', '', 'Video successfully added to watch later');
        }
      } catch (error) {
        console.error('Error adding to watch later:', error);
        console.error('Error response:', error.response?.data);
        showToast('error', '', `Failed to add video to watch later: ${error.response?.data?.error || error.message}`);
      }
    } else {
      showToast('warning', '', 'Kindly Login');
    }
  };

  const removeItemFromWatchLaterList = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      const user = jwt_decode(token);
      if (!user) {
        localStorage.removeItem('token');
        showToast('warning', '', 'Kindly Login');
        navigate('/login');
        return;
      }
      
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/api/watchlater/${video._id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        
        if (response.data.success) {
          console.log('VideoPage - Dispatching watch later removal with payload:', response.data.watchLater);
          dispatchWatchLaterList({ type: 'UPDATE_WATCH_LATER_LIST', payload: response.data.watchLater });
          setIsVideoPresentInWatchLater(false);
          showToast('success', '', 'Video successfully removed from watch later');
        }
      } catch (error) {
        console.error('Error removing from watch later:', error);
        showToast('error', '', 'Failed to remove video from watch later');
      }
    } else {
      showToast('warning', '', 'Kindly Login');
    }
  };

  // Post a new comment
  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setPostingComment(true);
    setCommentError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('warning', '', 'Kindly Login');
        setPostingComment(false);
        return;
      }
      const response = await axios.post(
        `${API_BASE_URL}/api/videos/${videoId}/comments`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data && response.data.comment) {
        setComments(prev => [...prev, response.data.comment]);
        setNewComment('');
      }
    } catch (err) {
      setCommentError('Failed to post comment');
    } finally {
      setPostingComment(false);
    }
  };

  // Edit comment handler
  const handleEditComment = (commentId, text) => {
    setEditingCommentId(commentId);
    setEditCommentText(text);
  };
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentText('');
  };
  const handleSaveEdit = async (commentId) => {
    if (!editCommentText.trim()) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('warning', '', 'Kindly Login');
        return;
      }
      const response = await axios.put(
        `${API_BASE_URL}/api/videos/${videoId}/comments/${commentId}`,
        { text: editCommentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data && response.data.comment) {
        setComments(prev => prev.map(c => c._id === commentId ? { ...c, text: response.data.comment.text } : c));
        setEditingCommentId(null);
        setEditCommentText('');
      }
    } catch (err) {
      showToast('error', '', 'Failed to update comment');
    }
  };

  // Delete comment handler
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    setDeletingCommentId(commentId);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('warning', '', 'Kindly Login');
        setDeletingCommentId(null);
        return;
      }
      await axios.delete(
        `${API_BASE_URL}/api/videos/${videoId}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch (err) {
      showToast('error', '', 'Failed to delete comment');
    } finally {
      setDeletingCommentId(null);
    }
  };

  // --- UI ---
  console.log("Video URL:", safeVideoSrcUrl);
  return (
    <div className="video-page-container">
      <div className="video-content-container">
        <div className="youtube-video-container">
          <CustomVideoPlayer 
            src={safeVideoSrcUrl}
            poster={video?.thumbnailUrl}
            onTimeUpdate={(time) => console.log('Video time:', time)}
            onEnded={() => console.log('Video ended')}
            onError={(error) => console.error('Video error:', error)}
          />
        </div>
        <h2 className="video-title">{safeTitle}</h2>
        <div className="video-info-and-options">
          <div className="video-info">
            <span>{videoViews} · by {safeUploader} · {getRelativeTime(video?.uploadedAt)}</span>
          </div>
          <div className="video-actions-bar">
            <button
              key={`like-${videoLikedStatus}-${forceUpdate}`}
              className={`video-action-btn like-btn ${videoLikedStatus === 'liked' ? 'active' : ''}`}
              onClick={handleLike}
              title="Like"
            >
              {videoLikedStatus === 'liked' ? <AiFillLike /> : <AiOutlineLike />} Like
            </button>
            <button
              key={`dislike-${videoLikedStatus}-${forceUpdate}`}
              className={`video-action-btn dislike-btn ${videoLikedStatus === 'disliked' ? 'active' : ''}`}
              onClick={handleDislike}
              title="Dislike"
            >
              {videoLikedStatus === 'disliked' ? <AiFillDislike /> : <AiOutlineDislike />} Dislike
            </button>
            <div className="video-kebab-menu-wrapper" style={{ position: 'relative' }}>
              <button
                className="video-action-btn kebab-btn"
                onClick={() => setShowKebabMenu((prev) => !prev)}
                title="More actions"
                style={{ padding: '0 8px' }}
              >
                <MdMoreVert style={{ fontSize: '24px' }} />
              </button>
              {showKebabMenu && (
                <div className="video-kebab-menu" style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', borderRadius: 8, zIndex: 10, minWidth: 180 }}>
                  <button
                    className={`video-action-btn watch-later-btn ${isVideoPresentInWatchLater ? 'active' : ''}`}
                    onClick={() => {
                      setShowKebabMenu(false);
                      if (isVideoPresentInWatchLater) {
                        removeItemFromWatchLaterList();
                      } else {
                        addItemToWatchLaterList();
                      }
                    }}
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 16px', borderRadius: 0, borderBottom: '1px solid #eee' }}
                  >
                    <MdAccessTime /> {isVideoPresentInWatchLater ? 'Added to watch later' : 'Add to watch later'}
                  </button>
                  <button
                    className="video-action-btn playlist-btn"
                    onClick={() => {
                      setShowKebabMenu(false);
                      setShowPlaylistModal(true);
                    }}
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 16px', borderRadius: '0 0 8px 8px' }}
                  >
                    <MdPlaylistAdd /> Add to playlist
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="video-description">
            <h4>Description</h4>
            <p>{safeDescription}</p>
        </div>
        {/* Comment Section */}
        <div className="video-comments-section">
          <h4>Comments</h4>
          {commentsLoading ? (
            <p>Loading comments...</p>
          ) : commentError ? (
            <p style={{ color: 'red' }}>{commentError}</p>
          ) : (
            <div className="comments-list">
              {comments.length === 0 ? (
                <p>No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment, idx) => {
                  const canEditOrDelete = currentUser && (comment.user?.toString?.() === currentUser.userId);
                  return (
                    <div key={comment._id || idx} className="comment-item">
                      <span className="comment-username">
                        {comment.username}
                        {comment.isUploader && (
                          <span className="uploader-badge"> (Uploader)</span>
                        )}
                      </span>
                      <span className="comment-date" style={{ marginLeft: 8, fontSize: 12, color: '#888' }}>
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                      {editingCommentId === comment._id ? (
                        <>
                          <textarea
                            value={editCommentText}
                            onChange={e => setEditCommentText(e.target.value)}
                            rows={2}
                            style={{ width: '100%', resize: 'vertical', marginTop: 6 }}
                          />
                          <button onClick={() => handleSaveEdit(comment._id)} style={{ marginRight: 8, marginTop: 4 }}>Save</button>
                          <button onClick={handleCancelEdit} style={{ marginTop: 4 }}>Cancel</button>
                        </>
                      ) : (
                        <div className="comment-text">{comment.text}</div>
                      )}
                      {canEditOrDelete && editingCommentId !== comment._id && (
                        <div className="comment-actions" style={{ marginTop: 4, display: 'flex', gap: '8px' }}>
                          <button
                            className="comment-action-btn edit-btn"
                            onClick={() => handleEditComment(comment._id, comment.text)}
                            style={{ marginRight: 8, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            title="Edit Comment"
                          >
                            <MdEdit style={{ fontSize: '18px' }} /> Edit
                          </button>
                          <button
                            className="comment-action-btn delete-btn"
                            onClick={() => handleDeleteComment(comment._id)}
                            disabled={deletingCommentId === comment._id}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            title="Delete Comment"
                          >
                            <MdDelete style={{ fontSize: '18px' }} />
                            {deletingCommentId === comment._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
          {/* Add Comment Box */}
          <div className="add-comment-box" style={{ marginTop: 16 }}>
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={2}
              style={{ width: '100%', resize: 'vertical', padding: 8 }}
              disabled={postingComment}
            />
            <button
              onClick={handlePostComment}
              disabled={postingComment || !newComment.trim()}
              style={{ marginTop: 8, padding: '6px 18px', borderRadius: 6, background: '#e94560', color: 'white', border: 'none', fontWeight: 500 }}
            >
              {postingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      </div>
      {showPlaylistModal && (
        <AddToPlaylistModal
          video={video}
          showPlaylistModal={showPlaylistModal}
          setShowPlaylistModal={setShowPlaylistModal}
        />
      )}
      <div className="video-recommendation-container">
        <h3>Recommended Videos</h3>
          {trendingVideosList && trendingVideosList.length > 0 ? (
            trendingVideosList.slice(0, 6).map((recVideo) => (
            <div className="recommendation-item" key={recVideo._id}>
              <RecommendationCard video={recVideo} />
            </div>
            ))
          ) : (
            <p>No recommendations available.</p>
          )}
      </div>
    </div>
  );
}

export { VideoPage };