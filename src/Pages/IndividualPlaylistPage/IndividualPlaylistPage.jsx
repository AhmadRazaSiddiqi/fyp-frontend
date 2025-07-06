import React, { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import axios from 'axios'
import './IndividualPlaylistPage.css'
import {
  VideoCard,
  usePlaylist
} from '../../index'
import API_BASE_URL from '../../config/api'

function IndividualPlaylistPage()
{
    const { state } = useLocation()
    const { allPlaylists } = usePlaylist()
    const [playlistVideos, setPlaylistVideos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    
    // Safety check for state
    const playlistId = state?.playlistId
    const playListName = state?.playListName || 'Unknown Playlist'

    // Safety check to ensure allPlaylists is always an array
    const safePlaylists = allPlaylists || []

    useEffect(() => {
        const fetchPlaylistVideos = async () => {
            if (!playlistId) {
                setError('No playlist ID provided')
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError(null)

                // Try to find playlist in existing data first
                const existingPlaylist = safePlaylists.find(playlist => playlist._id === playlistId)
                
                if (existingPlaylist && existingPlaylist.videosInPlaylist) {
                    setPlaylistVideos(existingPlaylist.videosInPlaylist)
                    setLoading(false)
                    return
                }

                // If not found in existing data, fetch from API
                const response = await axios.get(
                    `${API_BASE_URL}/api/playlists/${playlistId}`,
                    {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    }
                )

                if (response.data.success) {
                    setPlaylistVideos(response.data.playlist.videos || [])
                } else {
                    setError('Failed to load playlist')
                }
            } catch (error) {
                console.error('Error fetching playlist:', error)
                setError('Failed to load playlist. Please try again.')
            } finally {
                setLoading(false)
            }
        }

        fetchPlaylistVideos()
    }, [playlistId, safePlaylists])

    if (loading) {
        return (
            <div className='page-container'>
                <div className="individual-playlist-container">
                    <h2 className='individual-playlist-heading'>
                        Playlist - {playListName}
                    </h2>
                    <p>Loading playlist...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className='page-container'>
                <div className="individual-playlist-container">
                    <h2 className='individual-playlist-heading'>
                        Playlist - {playListName}
                    </h2>
                    <p style={{ color: 'red' }}>{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className='page-container'>
            <div className="individual-playlist-container">
                <h2 className='individual-playlist-heading'>
                    Playlist - {playListName}
                </h2>  
                {
                    playlistVideos.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <p>This playlist is empty.</p>
                        </div>
                    ) : (
                        <div className='individual-playlist-video-container'>
                            {
                                playlistVideos.map((video) =>
                                    <VideoCard 
                                        key={video._id} 
                                        video={video} 
                                        isPlayListCard={true} 
                                        playlistId={playlistId}
                                    />
                                )
                            }
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export { IndividualPlaylistPage }