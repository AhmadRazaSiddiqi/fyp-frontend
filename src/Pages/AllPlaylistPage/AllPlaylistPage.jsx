import React,{ useEffect } from 'react'
import { Link } from "react-router-dom"
import axios from "axios"
import jwt_decode from "jwt-decode"
import { useLocation } from "react-router-dom"
import './AllPlaylistPage.css'
import {
  PlaylistCard,
  usePlaylist
} from '../../index'
import API_BASE_URL from '../../config/api'
import Lottie from "react-lottie"
import ManInPark from "../../Assets/lottie/man-in-the-park.json"
import { useToast } from '../../index'
import { Sidebar } from '../../Components/Sidebar/Sidebar'

function AllPlaylistPage() {

  const { allPlaylists, setAllPlaylists } = usePlaylist()
  const { showToast } = useToast()

  // Safety check to ensure allPlaylists is always an array
  const safePlaylists = allPlaylists || []
  let numberOfPlaylists = safePlaylists.length;

  const manInParkObj = {
      loop: true,
      autoplay: true,
      animationData : ManInPark,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
      }
  }

  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {

    let token = localStorage.getItem("token")

    if(token)
    {
      let user = jwt_decode(token)

      if(user)
      {
        (async() => {
          try {
            let updatedUserInfo = await axios.get(
              `${API_BASE_URL}/api/playlists`,
              {
                headers : {'Authorization': `Bearer ${localStorage.getItem("token")}`}
              }
            )

            if(updatedUserInfo.data.success)
            {
              setAllPlaylists(updatedUserInfo.data.playlists)
            }
          } catch (error) {
            console.error('Error fetching playlists:', error)
            showToast("error","","Failed to load playlists. Please try again.")
          }
        })()
      }
    }
  },[])

  const deleteAllPlaylists = async () => {
    try {
      console.log('Deleting all playlists...');
      
      const updatedUserInfo = await axios.delete(
        `${API_BASE_URL}/api/playlists`,
        {
          headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
        }
      )

      console.log('Delete all playlists response:', updatedUserInfo.data);

      if(updatedUserInfo.data.success)
      {
        console.log('Setting playlists to:', updatedUserInfo.data.playlists);
        setAllPlaylists(updatedUserInfo.data.playlists)
        showToast("success","","All Playlists deleted!")
      } else {
        console.error('Delete all playlists failed:', updatedUserInfo.data);
        showToast("error","","Failed to delete all playlists. Please try again.")
      }
    } catch (error) {
      console.error('Error deleting all playlists:', error)
      showToast("error","","Failed to delete all playlists. Please try again.")
    }
  }

  return (
    <div className='page-container'>
      <Sidebar/>
      <div className={`playlist-container ${numberOfPlaylists===0? "dark-theme": "light-theme"}`}>
          <h2 className='playlist-heading'>
            {numberOfPlaylists} {numberOfPlaylists===1?"playlist is":"playlists are"} present
          </h2>
            {
              numberOfPlaylists!==0 &&
              (
                <button 
                  className="solid-secondary-btn red-solid-btn delete-all-playlists-btn"
                  onClick={deleteAllPlaylists}
                >
                  Delete all playlists
                </button>
              )
            }
            {
              numberOfPlaylists===0
              ? (
                <Lottie options={manInParkObj}
                height={570}
                style={{position:"absolute", margin: "auto", width: "60%"}}
                isStopped={false}
                isPaused={false}
              />
              )
              : (
                  <div className='playlist-video-container'>
                    {
                      safePlaylists.map((playlist)=>
                        <PlaylistCard key={playlist._id} playlist={playlist}/>
                      )               
                    }
                  </div>
                )
            }
      </div>
    </div>
  )
}

export { AllPlaylistPage };