import React,{ useEffect } from 'react'
import { Link, useLocation } from "react-router-dom"
import axios from "axios"
import jwt_decode from "jwt-decode"
import './VideoListingPage.css'
import {
  VideoCard,
  Tabs,
  useAllVideos
} from '../../index'
import LoadingLottie from "../../Assets/lottie/loading-0.json"
import { Sidebar } from '../../Components/Sidebar/Sidebar'

function VideoListingPage() {

  const { allVideosList, filteredVideosList } = useAllVideos()

  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className='page-container'>
      <Sidebar/>
      <div className='video-listing-page-container'>
        <Tabs/>
        <hr></hr>
        <div className='video-listing-page-main-container'>
          <div className='videos-container'>
            {
              filteredVideosList.map((video,index)=>
                  <VideoCard key={index} video={video}/>
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export { VideoListingPage };