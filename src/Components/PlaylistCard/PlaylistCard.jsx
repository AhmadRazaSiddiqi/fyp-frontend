import "./PlaylistCard.css"
import {
    BiTrashAlt
} from "react-icons/bi"
import axios from "axios"
import {
    useToast,
    usePlaylist
} from "../../index"
import { Link } from "react-router-dom"
import API_BASE_URL from '../../config/api';

function PlaylistCard({playlist})
{
    const { showToast } = useToast()
    const { setAllPlaylists } = usePlaylist()

    // Safety checks for playlist data
    if (!playlist) {
        return null; // Don't render if playlist is undefined
    }

    const safePlaylist = {
        _id: playlist._id || '',
        playListName: playlist.playListName || playlist.name || 'Untitled Playlist',
        videosInPlaylist: playlist.videosInPlaylist || playlist.videos || []
    };

    const deleteThisPlaylist = async () => {
        try {
            console.log('Deleting playlist:', safePlaylist._id, safePlaylist.playListName);
            
            const updatedUserInfo = await axios.delete(
                `${API_BASE_URL}/api/playlists/${safePlaylist._id}`,
                {
                    headers : {'Authorization': `Bearer ${localStorage.getItem("token")}`}
                }
            )
          
            console.log('Delete playlist response:', updatedUserInfo.data);
          
            if(updatedUserInfo.data.success)
            {
                console.log('Setting playlists to:', updatedUserInfo.data.playlists);
                setAllPlaylists(updatedUserInfo.data.playlists)
                showToast("success","","Successfully deleted playlist!")
            } else {
                console.error('Delete playlist failed:', updatedUserInfo.data);
                showToast("error","","Failed to delete playlist. Please try again.")
            }
        } catch (error) {
            console.error('Error deleting playlist:', error)
            showToast("error","","Failed to delete playlist. Please try again.")
        }
    }

    return (
        <Link to={`/playlist/${safePlaylist._id}`} state={{playlistId:safePlaylist._id, playListName: safePlaylist.playListName}}>
            <div className="playlist-card">
                <div className="playlist-details">
                    <h4>{safePlaylist.playListName}</h4>
                    <h4>{safePlaylist.videosInPlaylist.length} videos</h4>
                </div>
                <button 
                    className="icon-btn trash-button"
                    onClick={(event)=>{
                        event.preventDefault()
                        event.stopPropagation()
                        deleteThisPlaylist()
                    }}
                >
                    <div>
                        <BiTrashAlt/>
                    </div>
                </button>
            </div>
        </Link>
    )
}

export { PlaylistCard }