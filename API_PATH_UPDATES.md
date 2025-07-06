# Frontend API Path Updates

This document summarizes all the API path updates made to align the frontend with the new backend routes.

## 🔧 **Authentication Routes**

### Before:
- Login: `${API_BASE_URL}/login`
- Signup: `${API_BASE_URL}/register`

### After:
- Login: `${API_BASE_URL}/api/auth/login`
- Signup: `${API_BASE_URL}/api/auth/register`

### Changes:
- Updated paths to use `/api/auth/` prefix
- Changed login request body from `email` to `username`
- Updated input label from "Email address" to "Username"

---

## 🔐 **Authorization Header Format**

### Before:
```javascript
headers: { 'x-access-token': localStorage.getItem('token') }
```

### After:
```javascript
headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
```

### Changes:
- Standardized to use Bearer token format
- Updated all API calls across the application

---

## 👍👎 **Like/Dislike Routes**

### Before:
- Add to liked: `PATCH /api/likedvideos` with `{ video }`
- Remove from liked: `DELETE /api/likedvideos/:videoId` with `{ video }`
- Add to disliked: `PATCH /api/dislikedvideos` with `{ video }`
- Remove from disliked: `DELETE /api/dislikedvideos/:videoId` with `{ video }`

### After:
- Add to liked: `POST /api/likedvideos` with `{ videoId }`
- Remove from liked: `DELETE /api/likedvideos/:videoId`
- Add to disliked: `POST /api/dislikedvideos` with `{ videoId }`
- Remove from disliked: `DELETE /api/dislikedvideos/:videoId`

### Changes:
- Changed from PATCH to POST for adding
- Simplified request body to use `videoId` instead of full video object
- Removed unnecessary request body from DELETE operations

---

## 📋 **Playlist Routes**

### Before:
- Get playlists: `GET /api/user` (extract from user data)
- Create playlist: `POST /api/playlists` with `{ name }`
- Add to playlist: `PATCH /api/playlists/:playlistId/add` with `{ videoId }`
- Remove from playlist: `DELETE /api/playlist/delete/specificvideo` with `{ playlistId, videoId }`
- Delete playlist: `DELETE /api/playlist/delete/:playlistId`
- Delete all playlists: `DELETE /api/playlist/deleteall`

### After:
- Get playlists: `GET /api/playlists`
- Create playlist: `POST /api/playlists` with `{ name, description? }`
- Add to playlist: `PATCH /api/playlists/:playlistId/add` with `{ videoId }`
- Remove from playlist: `DELETE /api/playlists/:playlistId/remove` with `{ videoId }`
- Delete playlist: `DELETE /api/playlists/:playlistId`
- Delete all playlists: `DELETE /api/playlists`

### Changes:
- Standardized playlist routes under `/api/playlists`
- Simplified request bodies
- Added support for playlist descriptions
- Improved route consistency

---

## 📺 **Watch Later Routes**

### Before:
- Get watch later: `GET /api/user` (extract from user data)
- Add to watch later: `PATCH /api/watchlater` with `{ video }`
- Remove from watch later: `DELETE /api/watchlater/:videoId` with `{ video }`

### After:
- Get watch later: `GET /api/watchlater`
- Add to watch later: `POST /api/watchlater` with `{ videoId }`
- Remove from watch later: `DELETE /api/watchlater/:videoId`

### Changes:
- Changed from PATCH to POST for adding
- Simplified request body to use `videoId`
- Removed unnecessary request body from DELETE operations

---

## 📚 **History Routes**

### Before:
- Get history: `GET /api/user` (extract from user data)
- Add to history: `PATCH /api/history` with `{ video }`
- Remove from history: `DELETE /api/history/:videoId`
- Clear history: `DELETE /api/history/deleteall`

### After:
- Get history: `GET /api/history`
- Add to history: `POST /api/history` with `{ videoId }`
- Remove from history: `DELETE /api/history/:videoId`
- Clear history: `DELETE /api/history`

### Changes:
- Changed from PATCH to POST for adding
- Simplified request body to use `videoId`
- Standardized clear history route

---

## 📊 **Response Format Changes**

### Before:
```javascript
{
  status: "ok",
  user: {
    likedVideos: [...],
    dislikedVideos: [...],
    watchLater: [...],
    history: [...],
    allPlaylists: [...]
  }
}
```

### After:
```javascript
{
  success: true,
  likedVideos: [...],
  dislikedVideos: [...],
  watchLater: [...],
  history: [...],
  playlists: [...]
}
```

### Changes:
- Changed `status: "ok"` to `success: true`
- Moved data out of nested `user` object
- Standardized response structure across all routes

---

## 🔄 **Files Updated**

### Authentication:
- `Frontend/src/Pages/AuthenticationPages/Login.jsx`
- `Frontend/src/Pages/AuthenticationPages/Signup.jsx`

### Main App:
- `Frontend/src/App.js`

### Video Components:
- `Frontend/src/Pages/VideoPage/VideoPage.jsx`
- `Frontend/src/Components/VideoCard/VideoCard.jsx`

### Playlist Components:
- `Frontend/src/Pages/AllPlaylistPage/AllPlaylistPage.jsx`
- `Frontend/src/Components/PlaylistCard/PlaylistCard.jsx`
- `Frontend/src/Components/AddToPlaylistModal/AddToPlaylistModal.jsx`

### Feature Pages:
- `Frontend/src/Pages/LikedVideos/LikedVideos.jsx`
- `Frontend/src/Pages/WatchLater/WatchLater.jsx`
- `Frontend/src/Pages/History/History.jsx`

---

## ✅ **Benefits of Updates**

1. **Consistency**: All routes now follow a consistent pattern
2. **Security**: Proper Bearer token authentication
3. **Performance**: Simplified request bodies reduce payload size
4. **Maintainability**: Clearer route structure and response formats
5. **Error Handling**: Standardized error responses across all endpoints
6. **Documentation**: Better aligned with REST API best practices

---

## 🧪 **Testing**

To test the updated API calls:

1. Start the backend server:
   ```bash
   cd "FYP-Auth-Backend"
   npm start
   ```

2. Start the frontend:
   ```bash
   cd Frontend
   npm start
   ```

3. Test the following features:
   - User registration and login
   - Video like/dislike functionality
   - Playlist creation and management
   - Watch later functionality
   - History tracking
   - Video removal from playlists

All API calls should now work correctly with the updated backend routes! 