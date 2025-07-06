import { useState, useContext, createContext, useEffect} from 'react'
import axios from 'axios'
import API_BASE_URL from '../config/api'

const AllVideosContext = createContext()

let AllVideosProvider = ({children}) => 
{
    const [ allVideosList, setAllVideosList ] = useState([])
    const [ toggleTab, setToggleTab] = useState("all")
    const [ filteredVideosList, setFilteredVideosList ] = useState([])
    const [ isLoading, setIsLoading ] = useState(true)
    const [ error, setError] = useState(null)

    useEffect(() => {
        const fetchAllVideos = async () => {
            try {
                setIsLoading(true)
                setError(null)
                
                console.log('Fetching videos from:', `${API_BASE_URL}/api/home/allVideos`)
                
                const allVideosData = await axios.get(`${API_BASE_URL}/api/home/allVideos`)
                
                // console.log('API Response:', allVideosData.data)
                
                if (allVideosData.data && allVideosData.data.allvideos) {
                    setAllVideosList([...allVideosData.data.allvideos])
                    console.log('Videos set:', allVideosData.data.allvideos.length, 'videos')
                } else {
                    console.error('Invalid response format:', allVideosData.data)
                    setError('Invalid response format from server')
                }
            } catch (error) {
                console.error("Error fetching videos:", error)
                console.error("Error response:", error.response?.data)
                setError(error.response?.data?.error || 'Failed to fetch videos')
            } finally {
                setIsLoading(false)
            }
        }

        fetchAllVideos()
    }, [])

    useEffect(()=>{
        if(toggleTab==="all")
        {
            setFilteredVideosList(allVideosList)
        }
        else
        {
            setFilteredVideosList(prevFilteredList=>
                allVideosList.filter(video=>video.category===toggleTab))
        }
    },[allVideosList, toggleTab])

    // Add this function to update views for a specific video
    const updateAllVideosViews = (videoId, newViewCount) => {
      setAllVideosList(prevList =>
        prevList.map(video =>
          video._id === videoId ? { ...video, views: newViewCount } : video
        )
      );
    };

    return (
        <AllVideosContext.Provider value={{
            allVideosList, 
            setAllVideosList,
            toggleTab,
            setToggleTab,
            filteredVideosList,
            isLoading,
            error,
            updateAllVideosViews
        }}>
            {children}
        </AllVideosContext.Provider>
    )
}

let useAllVideos = () => useContext(AllVideosContext)

export { AllVideosProvider, useAllVideos }