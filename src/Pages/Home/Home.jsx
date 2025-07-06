import React,{ useEffect } from 'react'
import axios from "axios"
import jwt_decode from "jwt-decode"
import { Link, useLocation } from "react-router-dom"
import Lottie from "react-lottie"
import './Home.css'
import {
  Sidebar, 
  VideoCard, 
  Footer,
  useTrendingVideos
} from '../../index'
import sherlock from '../../Assets/images/sherlock4.jpg'
import LoadingLottie from "../../Assets/lottie/loading-0.json"
import API_BASE_URL from '../../config/api'

function Home() {
  const { trendingVideosList, setTrendingVideosList } = useTrendingVideos()

  const loadingObj = {
    loop: true,
    autoplay: true,
    animationData : LoadingLottie,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  }

  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Refetch trending videos when Home is mounted
  useEffect(() => {
    const fetchTrendingVideos = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/home/trendingvideos`);
        if (response.data && response.data.trendingvideos) {
          setTrendingVideosList(response.data.trendingvideos);
        }
      } catch (error) {
        console.error('Error refetching trending videos:', error);
      }
    };
    fetchTrendingVideos();
  }, []);

  let covervideo = {
    "_id": "62430b3be22ce0735254b2a5",
    "videoSrcUrl": "https://www.youtube.com/watch?v=5z32qzSqtXY",
    "title": "Sherlock plays the violin for the Eurus (Sherlok 4: The final problem)",
    "owner": "Mystery Strings",
    "thumbnail": "https://img.youtube.com/vi/5z32qzSqtXY/0.jpg",
    "description": "",
    "views": 1582160,
    "noOfLikes": 29000,
    "noOfDislikes": 2410,
    "comments": [],
    "__v": 0,
    "category": "crime"
  }

  return (
    <div className='page-container'>
      <Sidebar/>
      <div className='home-page-container'>
        
        <div className='home-page-cover-container'>
          <img className="home-page-cover-img" src={sherlock} alt="sherlock shot"></img>
          <div className='home-page-cover-description'>
            <h3>Best Detective show</h3>
            <p>Watch Sherlock Final Problem scene</p>
            <Link to={"/video/62430b3be22ce0735254b2a5"} state={{videoDetails:covervideo}}>
              <button className="solid-secondary-btn red-solid-btn">
                Watch Now
              </button>
            </Link>
          </div>
        </div>

        <h2 className='homepage-trending-heading'>Trending Videos</h2>
        {
          trendingVideosList.length===0 
          ? (
            <Lottie options={loadingObj}
              height={380}
              style={{ margin: "auto"}}
              isStopped={false}
              isPaused={false}
            />
          ) : (
            <>
            <div className='videos-container'>
              {
                trendingVideosList.map((video,index)=>{
                    return <VideoCard key={index} video={video}/>
                  }
                )
              }
            </div>
        <Link to="/explore">
          <button className="solid-secondary-btn red-solid-btn explore-btn">
                Explore all
          </button>
        </Link>
            </>
          )
        }
      </div>
    </div>
  )
}

export { Home };