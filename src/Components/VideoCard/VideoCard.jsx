import './VideoCard.css'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom"
import jwt_decode from "jwt-decode"
import {
    AiOutlineMore
} from "react-icons/ai"
import {
    BiTrashAlt
} from "react-icons/bi"
import {
    MdAccessTime,
    MdPlaylistAdd,
    MdHistory
} from "react-icons/md"
import {
    AddToPlaylistModal,
    useWatchLater,
    useToast, 
    useHistory,
    usePlaylist
} from '../../index'
import axios from 'axios'
import API_BASE_URL from '../../config/api'
import { getRelativeTime } from '../../utils/timeUtils'

function VideoCard({ video, itemInUserHistory, isPlayListCard, playlistId })
{
    const navigate = useNavigate()

    const { watchLaterList, dispatchWatchLaterList } = useWatchLater()
    const { showToast } = useToast()
    const { setUserHistoryList } = useHistory()
    const { setAllPlaylists } = usePlaylist()

    const [ showVideoOptions, setShowVideoOptions ] = useState(false)
    const [ isVideoPresentInWatchLater, setIsVideoPresentInWatchLater ] = useState(false)
    const [ showPlaylistModal, setShowPlaylistModal ] = useState(false)

    const {
        _id,
        title,
        thumbnail,
        views
    } = video

    let videoViews;

    if(views>1000000)
    {
        videoViews = (views/1000000).toFixed(1) + "M"
    }
    else
    {
        if(views>1000)
        {
            videoViews = (views/1000).toFixed(1) + "K"
        }
        else
        {
            videoViews = views + ""
        }
    }
    
    useEffect(()=>{
        console.log('VideoCard - useEffect triggered for video:', video._id);
        console.log('VideoCard - Current watchLaterList length:', watchLaterList.length);
        console.log('VideoCard - watchLaterList contents:', watchLaterList);
        
        const index = watchLaterList.findIndex(videoDetails=> {
            return videoDetails._id === video._id
        })

        console.log('VideoCard - Found video at index:', index);

        if(index!==-1)
        {
            console.log('VideoCard - Setting isVideoPresentInWatchLater to true');
            setIsVideoPresentInWatchLater(true)
        }
        else
        {
            console.log('VideoCard - Setting isVideoPresentInWatchLater to false');
            setIsVideoPresentInWatchLater(false)
        }
    },[watchLaterList, video._id])

    const addItemToWatchLaterList = async () => {
        const token = localStorage.getItem('token');
        console.log('VideoCard - Watch Later - Token:', token ? 'Present' : 'Missing');
        
        if (token) {
            const user = jwt_decode(token);
            console.log('VideoCard - Watch Later - User from token:', user);
            
            if (!user) {
                localStorage.removeItem('token');
                showToast("warning", "", "Kindly Login");
                navigate('/login');
                return;
            }
            
            try {
                console.log('VideoCard - Watch Later - Video ID:', video._id);
                console.log('VideoCard - Watch Later - Is already in watch later:', isVideoPresentInWatchLater);
                
                if (isVideoPresentInWatchLater) {
                    showToast("warning", "", "Video already present in Watch Later");
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
                    dispatchWatchLaterList({ type: 'UPDATE_WATCH_LATER_LIST', payload: response.data.watchLater });
                    setIsVideoPresentInWatchLater(true);
                    showToast("success", "", "Video successfully added to watch later");
                }
            } catch (error) {
                console.error('Error adding to watch later:', error);
                console.error('Error response:', error.response?.data);
                
                // If video is already in watch later, update the state to reflect this
                if (error.response?.data?.message === 'Video is already in watch later') {
                    console.log('Video is already in watch later, updating state...');
                    setIsVideoPresentInWatchLater(true);
                    showToast('info', '', 'Video is already in watch later');
                    
                    // Refresh the watch later list to get current state
                    try {
                        const refreshResponse = await axios.get(
                            `${API_BASE_URL}/api/watchlater`,
                            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                        );
                        if (refreshResponse.data.success) {
                            dispatchWatchLaterList({ type: 'UPDATE_WATCH_LATER_LIST', payload: refreshResponse.data.watchLater });
                        }
                    } catch (refreshError) {
                        console.error('Error refreshing watch later:', refreshError);
                    }
                } else {
                    showToast('error', '', `Failed to add video to watch later: ${error.response?.data?.error || error.message}`);
                }
            }
        } else {
            showToast("warning", "", "Kindly Login");
        }
    }

    const removeItemFromWatchLaterList = async () => {
        const token = localStorage.getItem('token');
        console.log('VideoCard - Remove Watch Later - Token:', token ? 'Present' : 'Missing');
        
        if (token) {
            const user = jwt_decode(token);
            console.log('VideoCard - Remove Watch Later - User from token:', user);
            
            if (!user) {
                localStorage.removeItem('token');
                showToast("warning", "", "Kindly Login");
                navigate('/login');
                return;
            }
            
            try {
                console.log('VideoCard - Remove Watch Later - Video ID:', video._id);
                
                const response = await axios.delete(
                    `${API_BASE_URL}/api/watchlater/${video._id}`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                console.log('Remove from watch later response:', response.data);
                
                if (response.data.success) {
                    dispatchWatchLaterList({ type: 'UPDATE_WATCH_LATER_LIST', payload: response.data.watchLater });
                    setIsVideoPresentInWatchLater(false);
                    showToast("success", "", "Video successfully removed from watch later");
                }
            } catch (error) {
                console.error('Error removing from watch later:', error);
                console.error('Error response:', error.response?.data);
                
                // If video is not in watch later, update the state to reflect this
                if (error.response?.data?.message === 'Video is not in watch later') {
                    console.log('Video is not in watch later, updating state...');
                    setIsVideoPresentInWatchLater(false);
                    showToast('info', '', 'Video is not in watch later');
                    
                    // Refresh the watch later list to get current state
                    try {
                        const refreshResponse = await axios.get(
                            `${API_BASE_URL}/api/watchlater`,
                            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                        );
                        if (refreshResponse.data.success) {
                            dispatchWatchLaterList({ type: 'UPDATE_WATCH_LATER_LIST', payload: refreshResponse.data.watchLater });
                        }
                    } catch (refreshError) {
                        console.error('Error refreshing watch later:', refreshError);
                    }
                } else {
                    showToast('error', '', `Failed to remove video from watch later: ${error.response?.data?.error || error.message}`);
                }
            }
        } else {
            showToast("warning", "", "Kindly Login");
        }
    }

    const removeVideoFromHistory = async () => {
        try {
            console.log('Removing video from history:', video._id);
            const response = await axios.delete(
            `${API_BASE_URL}/api/history/${video._id}`,
            {
                headers : {'Authorization': `Bearer ${localStorage.getItem('token')}`} 
            }
        )

            console.log('Remove from history response:', response.data);

            if(response.data.success)
            {
                setUserHistoryList(response.data.history)
                showToast("success", "", "Video removed from history")
            } else {
                showToast("error", "", "Failed to remove video from history")
            }
        } catch (error) {
            console.error('Error removing from history:', error);
            showToast("error", "", "Failed to remove video from history")
        }
    }

    const addToUserPlaylist = async () => {
        const token=localStorage.getItem('token')

        if(token)
        {
            const user = jwt_decode(token)
                
            if(!user)
            {
                localStorage.removeItem('token')
                showToast("warning","","Kindly Login")
                navigate('/login')
            }
            else
            {
                setShowPlaylistModal(true)
            }
        }
        else
        {
            showToast("warning","","Kindly Login")
        }
    }

    const removeVideoFromPlaylist = async () => {
        try {
            console.log('Removing video from playlist:', video._id, 'from playlist:', playlistId);
        
        const updatedUserInfo = await axios.delete(
            `${API_BASE_URL}/api/playlists/${playlistId}/remove`,
            {
                headers: {'Authorization': `Bearer ${localStorage.getItem("token")}`},
                data: {videoId: video._id}
            }
        )

            console.log('Remove from playlist response:', updatedUserInfo.data);

        if(updatedUserInfo.data.success)
        {
            setAllPlaylists(updatedUserInfo.data.playlists)
            showToast("success","","Video removed from playlist!")
            } else {
                showToast("error", "", "Failed to remove video from playlist")
            }
        } catch (error) {
            console.error('Error removing from playlist:', error);
            
            // Handle specific error cases
            if (error.response?.status === 400) {
                if (error.response?.data?.message?.includes('not in this playlist')) {
                    showToast("info", "", "Video is not in this playlist");
                } else {
                    showToast("error", "", `Failed to remove video from playlist: ${error.response?.data?.error || error.message}`);
                }
            } else {
                showToast("error", "", "Failed to remove video from playlist")
            }
        }
    } 

    return (
        <Link to={`/video/${_id}`} state={{videoDetails:video}}>
            <div className='video-card'>
                <img className="video-card-thumbnail-img" src={thumbnail} alt={`video-alternate-text`}></img>
                <h3 className="video-card-title">{title}</h3>
                <h5>{videoViews} views | {getRelativeTime(video.uploadedAt)}</h5>
                <div className="card-button">
                    {
                        isPlayListCard===true 
                        ? (
                            <button 
                                className="videocard-options-btn outline-card-secondary-btn"
                                onClick={event=>{
                                    event.preventDefault()
                                    event.stopPropagation()
                                    removeVideoFromPlaylist()
                                }}
                            >    
                                <BiTrashAlt style={{fontSize: "20px"}}/>
                            </button>
                        ) : (
                            <button 
                                className="videocard-options-btn outline-card-secondary-btn"
                                onClick={event=>{
                                    event.preventDefault()
                                    event.stopPropagation()
                                    setShowVideoOptions(prevState=> !prevState)
                                }}
                            >    
                                <AiOutlineMore style={{fontSize: "20px"}}/>
                            </button>
                        )
                    }
                </div>
                {
                    showVideoOptions && (
                        <div className='videocard-options-container'>
                            {
                                isVideoPresentInWatchLater
                                ? (
                                    <div 
                                        className='videocard-options'
                                        onClick={(event)=>{
                                            event.preventDefault()
                                            event.stopPropagation()
                                            removeItemFromWatchLaterList()
                                            setShowVideoOptions(false)
                                        }}
                                    >
                                        <MdAccessTime style={{fontSize: "20px"}}/>
                                        <h5>Remove from watch later</h5>
                                    </div>
                                ): (
                                    <div 
                                        className='videocard-options'
                                        onClick={(event)=>{
                                            event.preventDefault()
                                            event.stopPropagation()
                                            addItemToWatchLaterList()
                                            setShowVideoOptions(false)
                                        }}
                                    >
                                        <MdAccessTime style={{fontSize: "20px"}}/>
                                        <h5>Add to watch later</h5>
                                    </div>
                                )
                            }
                            
                            <div className='videocard-options'
                                onClick={(event)=>{
                                    event.preventDefault()
                                    event.stopPropagation()
                                    addToUserPlaylist()
                                    setShowVideoOptions(false)
                                }}
                            >
                                <MdPlaylistAdd style={{fontSize: "20px"}}/>
                                <h5>Add to your playlist</h5>
                            </div>
                            {
                                itemInUserHistory && 
                                (
                                    <div className='videocard-options'
                                        onClick={(event)=>{
                                            event.preventDefault()
                                            event.stopPropagation()
                                            removeVideoFromHistory()
                                            setShowVideoOptions(false)
                                        }}
                                    >
                                        <MdHistory style={{fontSize: "20px"}}/>
                                        <h5>Remove from history</h5>
                                    </div>
                                )
                            }
                        </div>
                    )
                }
                <AddToPlaylistModal 
                    showPlaylistModal={showPlaylistModal} 
                    setShowPlaylistModal={setShowPlaylistModal}
                    video={video}
                    onClick={(event)=>{
                        event.preventDefault()
                        event.stopPropagation()
                    }}
                />            
            </div>
        </Link>
    )
}

export { VideoCard }