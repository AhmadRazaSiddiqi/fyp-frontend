import { useState, useContext, createContext, useEffect} from 'react'
import axios from 'axios'
import API_BASE_URL from '../config/api'

const TrendingVideosContext = createContext()

let TrendingVideosProvider = ({children}) => 
{
    const [ trendingVideosList, setTrendingVideosList ] = useState([])

    const updateTrendingVideoViews = (videoId, newViewCount) => {
      setTrendingVideosList(prevList =>
        prevList.map(video =>
          video._id === videoId ? { ...video, views: newViewCount } : video
        )
      );
    };

    useEffect(() => {
        try {
          (async () => {
              const trendingVideosData = await axios.get(`${API_BASE_URL}/api/home/trendingvideos`)
              setTrendingVideosList([...trendingVideosData.data.trendingvideos])
          }) ()
        }
        catch(error) {
          console.log("Error : ", error)
        }
      },[])

    return (
        <TrendingVideosContext.Provider value={{
            trendingVideosList, 
            setTrendingVideosList,
            updateTrendingVideoViews
        }}>
            {children}
        </TrendingVideosContext.Provider>
    )
}

let useTrendingVideos = () => useContext(TrendingVideosContext)

export { TrendingVideosProvider, useTrendingVideos }