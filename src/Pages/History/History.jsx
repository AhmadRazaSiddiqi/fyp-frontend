import React,{ useEffect } from 'react'
import Lottie from 'react-lottie'
import jwt_decode from "jwt-decode"
import { useLocation } from "react-router-dom"
import './History.css'
import {
  Sidebar,
  VideoCard,
  useToast,
  useHistory
} from '../../index'
import sherlockLottie from "../../Assets/lottie/sherlock2.json"
import axios from 'axios'
import API_BASE_URL from '../../config/api'

function History() {

  const { showToast } = useToast()
  const { userHistoryList, setUserHistoryList } = useHistory()
  const { pathname } = useLocation();
  const numberOfVideosInHistory = userHistoryList.length;

  console.log('History - Current userHistoryList:', userHistoryList);
  console.log('History - Number of videos:', numberOfVideosInHistory);

  const sherlockObj = {
    loop: true,
    autoplay: true,
    animationData : sherlockLottie,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const clearAllHistory = () => {
    (async () => {
      try {
        console.log('Attempting to clear history...');
        const response = await axios.delete(
          `${API_BASE_URL}/api/history/deleteall`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
        );
        console.log('Clear history response:', response.data);
        if (response.data.status === "ok") {
          // Optionally, fetch history again to ensure UI is in sync
          try {
            const refreshed = await axios.get(`${API_BASE_URL}/api/history`, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setUserHistoryList(refreshed.data.history || []);
          } catch (fetchErr) {
            console.error('Error fetching refreshed history:', fetchErr);
            setUserHistoryList([]);
          }
          showToast("success", "", "History Cleared Successfully!");
        } else {
          showToast("error", "", "Failed to clear history. Please try again.");
        }
      } catch (error) {
        console.error('Error clearing history:', error);
        showToast("error", "", "Failed to clear history. Please try again.");
      }
    })();
  }

  useEffect(()=>{

    const token=localStorage.getItem('token')

    if(token)
    {
      const user = jwt_decode(token)
      if(!user)
      {
        localStorage.removeItem('token')
      }
      else
      {
        (async () => {
          try {
            console.log('Fetching history data...');
            let historyResponse = await axios.get(
              `${API_BASE_URL}/api/history`,
              {
                headers:
                {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
              }
          )

            console.log('History response:', historyResponse.data);

            if(historyResponse.data.success)
          {
              setUserHistoryList(historyResponse.data.history)
            } else {
              console.error('History fetch failed:', historyResponse.data);
              showToast('error', '', 'Failed to load history');
            }
          } catch (error) {
            console.error('Error fetching history:', error);
            showToast('error', '', 'Failed to load history');
          }  
        })()
      }
    }
  },[setUserHistoryList, showToast])

  return (
      <div className='page-container'>
      <Sidebar/>
        <div className={`history-page-container ${numberOfVideosInHistory===0? "dark-theme": "light-theme"}`}>
          <h2 className='history-page-heading'>Your Browsing History {numberOfVideosInHistory===0?"is empty":""}</h2>
          {
            numberOfVideosInHistory!==0 &&
            (
              <button 
                className="solid-secondary-btn red-solid-btn clear-history-btn"
                onClick={clearAllHistory}
              >
                Clear all history
              </button>
            )
          }
          {
            numberOfVideosInHistory===0
            ? (
              <Lottie options={sherlockObj}
                height={470}
                style={{position:"relative",bottom:"3rem", backgroundColor: "#0b5c72", width: "65%"}}
                isStopped={false}
                isPaused={false}
                onClick={()=>{}}
              />
            )
            : (
                <div className='watch-later-video-container'>
                  {
                    userHistoryList.map((video)=>
                    <VideoCard key={video._id} video={video} itemInUserHistory={"true"}/>)
                  }
                </div>
              )
          }
      </div>
    </div>
  )
}

export { History };