import { useState } from "react"
import './AddToPlaylistModal.css'
import {
    GrClose
} from 'react-icons/gr'
import {
    AiOutlinePlus
} from 'react-icons/ai'
import {
    usePlaylist,
    useToast
} from '../../index'
import axios from "axios"
import API_BASE_URL from '../../config/api'

function AddToPlaylistModal({video, showPlaylistModal, setShowPlaylistModal})
{

    const { allPlaylists, setAllPlaylists }                   = usePlaylist()
    const { showToast }                                       = useToast()

    const [ addToNewPlaylist, setAddToNewPlaylist ]           = useState(false)
    const [ newPlaylistName, setNewPlaylistName ]             = useState("")

    // Safety check to ensure allPlaylists is always an array
    const safePlaylists = allPlaylists || []

    const addVideoToNewPlaylist = async () => {
        try {
            console.log('Creating new playlist with video:', video._id);
            
            // 1. Create the playlist
            const createRes = await axios.post(
                `${API_BASE_URL}/api/playlists`,
                { name: newPlaylistName },
                { headers : {'Authorization': `Bearer ${localStorage.getItem("token")}`} }
            );

            console.log('Playlist creation response:', createRes.data);

            if (createRes.data.success) {
                // Get the newly created playlist from the response
                const newPlaylist = createRes.data.playlist;
                
                console.log('New playlist created:', newPlaylist);
                
                // 2. Add the video to the new playlist
                if (newPlaylist && newPlaylist._id && video && video._id) {
                    console.log('Adding video to new playlist:', video._id, '->', newPlaylist._id);
                    
                    const addVideoRes = await axios.patch(
                        `${API_BASE_URL}/api/playlists/${newPlaylist._id}/add`,
                        { videoId: video._id },
                        { headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`} }
                    );
                    
                    console.log('Add video response:', addVideoRes.data);
                    
                    if (!addVideoRes.data.success) {
                        throw new Error('Failed to add video to playlist');
                    }
                } else {
                    console.error('Missing playlist or video data:', { newPlaylist, video });
                    throw new Error('Missing playlist or video data');
                }

                // 3. Refresh playlists to get updated data
                const playlistsResponse = await axios.get(
                    `${API_BASE_URL}/api/playlists`,
                    { headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`} }
                );
                
                console.log('Refreshed playlists:', playlistsResponse.data);
                
                setAllPlaylists(playlistsResponse.data.playlists);
                setNewPlaylistName("");
                setShowPlaylistModal(false);
                showToast("success","","Video successfully added to playlist!");
            } else {
                throw new Error('Failed to create playlist');
            }
        } catch (error) {
            console.error('Error creating playlist or adding video:', error);
            
            // Handle specific error cases
            if (error.response?.status === 400) {
                if (error.response?.data?.error?.includes('already exists')) {
                    showToast("warning", "", "A playlist with this name already exists. Please choose a different name.");
                } else {
                    showToast("error", "", `Failed to create playlist: ${error.response?.data?.error || error.message}`);
                }
            } else {
                showToast("error", "", `Failed to create playlist or add video: ${error.message}`);
            }
        }
    }

    const addVideoToThisExistingPlaylist = async (event, playlistId) => {
        try {
            const updatedUserInfo = await axios.patch(
                `${API_BASE_URL}/api/playlists/${playlistId}/add`,
                {
                    videoId: video._id
                },
                {
                    headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
                }
            )

            if(updatedUserInfo.data.success)
            {
                // Refresh playlists
                const playlistsResponse = await axios.get(
                    `${API_BASE_URL}/api/playlists`,
                    {
                        headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
                    }
                )
                setAllPlaylists(playlistsResponse.data.playlists)
                setShowPlaylistModal(false)
                showToast("success","","Video successfully added to playlist!")
            }
        } catch (error) {
            console.error('Error adding video to playlist:', error)
            
            // Handle specific error cases
            if (error.response?.status === 400) {
                if (error.response?.data?.message?.includes('already in this playlist')) {
                    showToast("info", "", "Video is already in this playlist");
                } else {
                    showToast("error", "", `Failed to add video to playlist: ${error.response?.data?.error || error.message}`);
                }
            } else {
                showToast("error", "", `Failed to add video to playlist: ${error.message}`);
            }
        }
    }

    return (
        <>
        {
            showPlaylistModal && (
                <div 
                    className="playlist-modal-container"
                    onClick={(event)=>{
                        event.preventDefault()
                        event.stopPropagation()
                    }}
                >
                    <div 
                        className="playlist-modal"
                        onClick={(event)=>{
                            event.preventDefault()
                            event.stopPropagation()
                        }}
                    >
                        <div 
                            className="playlist-modal-header-container"
                            onClick={(event)=>{
                                event.preventDefault()
                                event.stopPropagation()
                            }}
                        >
                            <h4>Save to . . .</h4>
                            <GrClose 
                                className="add-to-playlist-close-modal-btn" 
                                style={{width:'20px', height:'20px'}}
                                onClick={(event)=>{
                                    event.preventDefault()
                                    event.stopPropagation()
                                    setShowPlaylistModal(prevState=> !prevState)
                                    setAddToNewPlaylist(false)
                                }}
                            />
                        </div>
                        <hr></hr>

                        {
                            safePlaylists.length !== 0 && (
                                <>
                                    <div 
                                        className="current-playlist-options-container"
                                        onClick={(event)=>{
                                            event.preventDefault()
                                            event.stopPropagation()
                                        }}
                                    >
                                        {
                                            safePlaylists.map((playlist,index)=>{

                                                return  (
                                                    <div 
                                                        key={playlist._id} 
                                                        className="current-playlist-options"
                                                        onClick={(event)=>addVideoToThisExistingPlaylist(event, playlist._id)}
                                                    >
                                                        <p>{playlist.name}</p>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                    <hr></hr>
                                </>
                            )
                        }
                        {
                            addToNewPlaylist ?
                            (
                                <div className="new-playlist">
                                    <label htmlFor="new-playlist-name">Name</label>
                                    <input 
                                        id='new-playlist-name'
                                        value={newPlaylistName}
                                        onChange={(event)=>
                                            {
                                                event.preventDefault()
                                                event.stopPropagation()
                                                setNewPlaylistName(event.target.value)
                                            }
                                        }
                                    ></input>
                                    <button 
                                        className="solid-success-btn create-playlist-btn"
                                        onClick={addVideoToNewPlaylist}
                                    >
                                        Create
                                    </button>
                                </div>
                            ) :
                            (
                                <div 
                                    className="create-new-playlist-option"
                                    onClick={(event)=>{
                                        event.preventDefault()
                                        event.stopPropagation()
                                        setAddToNewPlaylist(true)
                                    }}
                                >
                                    <AiOutlinePlus style={{fontSize: '18px'}}/>
                                    <p>Create new playlist</p>
                                </div>
                            )
                        }
                    </div>
                </div>
            )
        }
        </>
    )
}

export { AddToPlaylistModal }