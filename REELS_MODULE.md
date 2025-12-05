# Reels Module Documentation

A complete Instagram-style Reels feature for the PhoneBid Marketplace application.

## Features

- **Vertical Swipe Feed** - Instagram-like full-screen video feed with snap scrolling
- **Video Recording** - Record videos directly in-app (max 30 seconds)
- **Gallery Upload** - Upload pre-recorded videos from device
- **Cloudinary Integration** - Cloud storage for videos with auto-generated thumbnails
- **User Profile Integration** - View user's reels in a 3-column grid
- **Progress Tracking** - Upload progress bar with percentage
- **Likes System** - Like/unlike reels with real-time count updates
- **Comments System** - Add, view, and delete comments with anonymous IDs

---

## Backend Implementation

### Environment Variables

Add to `server/.env`:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### MongoDB Schema (`server/models/Reel.js`)

| Field | Type | Description |
|-------|------|-------------|
| userId | ObjectId | Reference to User model |
| videoUrl | String | Cloudinary secure URL |
| thumbnailUrl | String | Auto-generated thumbnail |
| cloudinaryPublicId | String | For deletion |
| duration | Number | Max 30 seconds |
| description | String | Optional, max 500 chars |
| views | Number | View counter |
| likes | [ObjectId] | Array of user IDs who liked |
| comments | [Comment] | Array of comment subdocuments |
| isActive | Boolean | Soft delete flag |

### Comment Schema (Embedded)

| Field | Type | Description |
|-------|------|-------------|
| userId | ObjectId | Reference to User model |
| text | String | Comment text, max 300 chars |
| createdAt | Date | Timestamp |

### API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/reels/upload` | ✅ | Upload new reel (multipart/form-data) |
| GET | `/api/reels/all` | ❌ | Get all reels (paginated) |
| GET | `/api/reels/user/:userId` | ❌ | Get user's reels |
| GET | `/api/reels/my/reels` | ✅ | Get current user's reels |
| GET | `/api/reels/:id` | ❌ | Get single reel |
| DELETE | `/api/reels/:id` | ✅ | Delete reel (owner/admin only) |
| POST | `/api/reels/:id/like` | ✅ | Toggle like on a reel |
| GET | `/api/reels/:id/like/status` | ✅ | Check if user liked a reel |
| GET | `/api/reels/:id/comments` | ❌ | Get comments (paginated) |
| POST | `/api/reels/:id/comments` | ✅ | Add a comment |
| DELETE | `/api/reels/:id/comments/:commentId` | ✅ | Delete a comment |

### Upload Request Format

```javascript
// POST /api/reels/upload
// Content-Type: multipart/form-data

FormData {
  video: File,        // Video file (mp4, webm, mov)
  duration: Number,   // Video duration in seconds
  description: String // Optional description
}
```

### Response Format

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "userId": { "name": "...", "anonymousId": "USER_XXXXX" },
    "videoUrl": "https://res.cloudinary.com/...",
    "thumbnailUrl": "https://res.cloudinary.com/...",
    "duration": 15,
    "description": "My reel",
    "views": 0,
    "likes": [],
    "comments": [],
    "likesCount": 0,
    "commentsCount": 0,
    "createdAt": "..."
  }
}
```

### Like Response Format

```json
{
  "success": true,
  "data": {
    "liked": true,
    "likesCount": 5
  }
}
```

### Comment Response Format

```json
{
  "success": true,
  "data": {
    "comment": {
      "_id": "...",
      "userId": { "name": "John", "anonymousId": "USER_ABC123" },
      "text": "Great reel!",
      "createdAt": "..."
    },
    "commentsCount": 10
  }
}
```

---

## Frontend Implementation

### Components

#### 1. ReelsFeed (`client/src/components/reels/ReelsFeed.jsx`)
Full-screen vertical swipe feed with:
- Snap scrolling
- Auto-play on visible
- Mute/unmute toggle
- Play/pause on tap
- User info overlay (shows anonymous ID)
- Infinite scroll pagination
- Like button with count (heart icon, fills red when liked)
- Comment button with count (opens modal)
- Share button (copies link to clipboard)
- Comments modal with:
  - List of comments showing anonymous IDs
  - Add new comment input
  - Delete own comments
  - Pagination for loading more comments

#### 2. UserReels (`client/src/components/reels/UserReels.jsx`)
3-column grid for profile pages:
- Thumbnail preview
- Duration badge
- View count
- Delete button (for owner)
- Click to play modal

#### 3. UploadReel (`client/src/components/reels/UploadReel.jsx`)
Floating action button with modal:
- **Upload from Device**: File picker with duration validation
- **Record Video**: MediaRecorder API with 30s timer
- Progress bar during upload
- Description input

### Pages

#### Reels Page (`client/src/pages/Reels.jsx`)
- Route: `/reels`
- Shows ReelsFeed component
- Floating upload button (authenticated users only)

### Routes Added to App.jsx

```jsx
<Route path="/reels" element={<Reels />} />
```

### Navigation
Added "Reels" link in navbar for authenticated users.

### Profile Integration
Added "My Reels" tab in UserProfile page with:
- Reel count in stats
- 3-column grid view
- Delete functionality
- "Create Reel" button

---

## File Structure

```
server/
├── config/
│   └── cloudinary.js          # Cloudinary setup & upload helpers
├── controllers/
│   └── reelController.js      # CRUD operations
├── middleware/
│   └── uploadMiddleware.js    # Multer config for videos
├── models/
│   └── Reel.js               # MongoDB schema
└── routes/
    └── reels.js              # API routes

client/src/
├── components/reels/
│   ├── index.js              # Exports
│   ├── ReelsFeed.jsx         # Vertical feed
│   ├── UserReels.jsx         # Profile grid
│   └── UploadReel.jsx        # Upload modal
├── pages/
│   └── Reels.jsx             # Main page
└── services/
    └── reelService.js        # API calls
```

---

## Usage

### Recording a Video
1. Click the "+" floating button
2. Select "Record Video"
3. Allow camera/microphone permissions
4. Click record button (auto-stops at 30s)
5. Add description (optional)
6. Click "Upload"

### Uploading from Gallery
1. Click the "+" floating button
2. Select "Upload Video"
3. Choose video file (max 30s, 50MB)
4. Add description (optional)
5. Click "Upload"

### Viewing Reels
- Navigate to `/reels` for full-screen feed
- Swipe up/down to navigate
- Tap to play/pause
- Click speaker icon to unmute

---

## Validation Rules

- **Duration**: Max 30 seconds
- **File Size**: Max 50MB
- **File Types**: MP4, WebM, MOV, AVI, MKV
- **Description**: Max 500 characters
- **Comment Text**: Max 300 characters

---

## Likes & Comments Features

### Likes
- Users can like/unlike reels by clicking the heart icon
- Like count is displayed below the heart icon
- Heart fills red when liked
- Requires authentication to like

### Comments
- Click the comment icon to open the comments modal
- Comments display:
  - User's anonymous ID (e.g., USER_ABC123)
  - Comment text
  - Time ago (e.g., "5m ago", "2h ago")
- Users can delete their own comments
- Reel owners can delete any comment on their reel
- Admins can delete any comment
- Comments are sorted newest first
- Pagination support for loading more comments

### Privacy
- All interactions show anonymous IDs instead of real names
- User avatars show first letter of name
- Anonymous IDs format: USER_XXXXXXXX

---

## Dependencies Added

### Backend
```bash
npm install cloudinary
```

### Frontend
Uses existing dependencies:
- axios (API calls)
- lucide-react (icons)
- react-hot-toast (notifications)
