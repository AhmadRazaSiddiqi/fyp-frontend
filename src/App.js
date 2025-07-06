import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import jwt_decode from "jwt-decode";
import {
  Navbar,
  Toast,
  Home,
  Login,
  Signup,
  VideoListingPage,
  VideoPage,
  WatchLater,
  AllPlaylistPage,
  History,
  LikedVideos,
  usePlaylist,
  useWatchLater,
  IndividualPlaylistPage,
  UploadVideo,
} from "./index";
import { useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "./config/api";

function App() {
  const { allPlaylists, setAllPlaylists } = usePlaylist();
  const { dispatchWatchLaterList } = useWatchLater();

  window.YTConfig = {
    host: "https://www.youtube.com",
  };

  useEffect(() => {
    let token = localStorage.getItem("token");

    if (token) {
      try {
        let user = jwt_decode(token);

        if (user) {
          (async () => {
            try {
              let updatedUserInfo = await axios.get(`${API_BASE_URL}/api/user`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
              });

              if (updatedUserInfo.data.status === "ok") {
                setAllPlaylists(updatedUserInfo.data.user.allPlaylists);
                // Also initialize watch later list
                if (updatedUserInfo.data.user.watchLater) {
                  console.log('App - Initializing watch later list:', updatedUserInfo.data.user.watchLater);
                  dispatchWatchLaterList({ type: 'UPDATE_WATCH_LATER_LIST', payload: updatedUserInfo.data.user.watchLater });
                }
              }
            } catch (error) {
              console.log('User data fetch error:', error.response?.status);
              // If token is invalid, remove it
              if (error.response?.status === 401 || error.response?.status === 404) {
                localStorage.removeItem("token");
              }
            }
          })();
        }
      } catch (decodeError) {
        console.log('Token decode error:', decodeError);
        localStorage.removeItem("token");
      }
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          {/* Auth routes - no layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Main routes with layout */}
          
            <Route path="/" element={<Home />} />
            <Route path="explore" element={<VideoListingPage />} />
            <Route path="video/:id" element={<VideoPage />} />
            <Route path="watch-later" element={<WatchLater />} />
            <Route path="liked-videos" element={<LikedVideos />} />
            <Route path="playlist" element={<AllPlaylistPage />} />
            <Route path="playlist/:playlistId" element={<IndividualPlaylistPage />} />
            <Route path="history" element={<History />} />
            <Route path="upload-video" element={<UploadVideo />} />
          
        </Routes>
        <Toast position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;
