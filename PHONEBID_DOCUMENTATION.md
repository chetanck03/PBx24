# PhoneBid - Anonymous Phone Auction Marketplace

## Complete Technical Documentation

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Features](#features)
5. [System Design](#system-design)
6. [API Routes](#api-routes)
7. [Database Models](#database-models)
8. [Authentication Flow](#authentication-flow)
9. [Real-time Features](#real-time-features)
10. [Deployment](#deployment)

---

## Overview

PhoneBid is a full-stack anonymous phone auction marketplace where users can buy and sell phones through a secure bidding system. The platform ensures user privacy through anonymous IDs while maintaining trust through KYC verification.

### Key Highlights
- **Anonymous Trading**: Users interact via anonymous IDs (e.g., `USER_A7X9K2`)
- **Real-time Bidding**: Live auction updates via WebSocket
- **KYC Verification**: Government ID verification for trust
- **Reels Feature**: TikTok-style video content for phone showcases
- **AI Chatbot**: Intelligent assistant for platform queries
- **Admin Dashboard**: Complete platform management

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                          │
│                        Vercel Deployment                        │
├─────────────────────────────────────────────────────────────────┤
│  Pages: Home, Marketplace, Dashboard, Reels, Admin, Auth        │
│  State: React Context (AuthContext)                             │
│  Styling: Tailwind CSS                                          │
│  Real-time: Socket.io Client                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / WSS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVER (Node.js)                          │
│                       Render Deployment                         │
├─────────────────────────────────────────────────────────────────┤
│  Framework: Express.js                                          │
│  Auth: JWT + Google OAuth                                       │
│  Real-time: Socket.io Server                                    │
│  File Upload: Multer + Cloudinary                               │
│  Email: Nodemailer (Gmail SMTP)                                 │
│  AI: Google Gemini API                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    MongoDB      │ │     Redis       │ │   Cloudinary    │
│   Atlas Cloud   │ │   Cloud Cache   │ │  Media Storage  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite | Build Tool |
| React Router v6 | Client-side Routing |
| Tailwind CSS | Styling |
| Socket.io Client | Real-time Communication |
| Axios | HTTP Client |
| React Hot Toast | Notifications |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web Framework |
| MongoDB + Mongoose | Database |
| Redis (ioredis) | Caching & Sessions |
| Socket.io | WebSocket Server |
| JWT | Authentication |
| Passport.js | Google OAuth |
| Nodemailer | Email Service |
| Cloudinary | Media Storage |
| Google Gemini | AI Chatbot |

### DevOps
| Service | Purpose |
|---------|---------|
| Vercel | Frontend Hosting |
| Render | Backend Hosting |
| MongoDB Atlas | Database Hosting |
| Redis Cloud | Cache Hosting |
| Cloudinary | CDN & Media |

---

## Features

### 1. User Authentication
- **Email + OTP Registration**: 6-digit OTP verification
- **Google OAuth**: One-click Google sign-in
- **KYC Verification**: Government ID upload (Aadhaar/PAN/Passport)
- **Password Reset**: OTP-based password recovery
- **JWT Sessions**: 7-day token expiry

### 2. Phone Listings
- **Create Listing**: Multi-image upload (2-6 images)
- **Phone Details**: Brand, model, storage, RAM, condition
- **Accessories**: Charger, box, bill tracking
- **Verification**: Admin approval before going live
- **Status Flow**: `pending` → `approved/rejected` → `live` → `sold`

### 3. Auction System
- **Real-time Bidding**: Live bid updates via WebSocket
- **Minimum Bid**: Seller sets starting price
- **Bid Validation**: Must exceed current highest bid
- **Anonymous Bidding**: Bidders identified by anonymous IDs
- **Bid Acceptance**: Seller can accept any bid

### 4. Reels (Video Content)
- **Video Upload**: Max 30 seconds, 50MB limit
- **Image Carousels**: Multiple images per reel
- **Engagement**: Likes, comments, shares
- **View Tracking**: Unique view counts
- **Public Access**: Viewable without login

### 5. AI Chatbot
- **Natural Language**: Understands user queries
- **Phone Search**: "Show me iPhones under 30000"
- **Platform Help**: Auction process, selling guide
- **Real-time Data**: Fetches live inventory

### 6. Admin Dashboard
- **Overview**: Platform statistics
- **User Management**: View, ban, delete users
- **Phone Management**: Approve/reject listings
- **KYC Verification**: Review government IDs
- **Complaint Handling**: Resolve user issues
- **Reel Moderation**: Delete inappropriate content

### 7. User Dashboard
- **My Phones**: Listed phones with delete option
- **My Bids**: Active bids tracking
- **Sold Phones**: Completed sales history
- **Purchased Phones**: Won auctions

### 8. Complaints System
- **File Complaints**: Against users or transactions
- **Status Tracking**: pending → in_progress → resolved
- **Admin Response**: Resolution notes

---

## System Design

### Anonymous ID Generation
```javascript
// Format: USER_XXXXXX (6 alphanumeric characters)
const generateAnonymousId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'USER_';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};
```

### Bid Flow
```
User Places Bid
      │
      ▼
┌─────────────────┐
│ Validate Amount │ → Must be > current bid
└─────────────────┘
      │
      ▼
┌─────────────────┐
│  Save to DB     │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Emit WebSocket  │ → Notify all viewers
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Update Phone    │ → currentBid, bidCount
└─────────────────┘
```

### Phone Status Flow
```
PENDING ──(Admin Approves)──► LIVE ──(Bid Accepted)──► SOLD
    │                           │
    └──(Admin Rejects)──► REJECTED
```

---

## API Routes

### Authentication (`/api/v2/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/signup/send-otp` | Send OTP for registration | No |
| POST | `/signup/verify-otp` | Verify OTP & create account | No |
| POST | `/login` | Email/password login | No |
| POST | `/reset/send-otp` | Send password reset OTP | No |
| POST | `/reset/verify-otp` | Reset password with OTP | No |
| GET | `/google` | Google OAuth initiate | No |
| GET | `/google/callback` | Google OAuth callback | No |

### Users (`/api/users`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/profile` | Get current user profile | Yes |
| PUT | `/profile` | Update profile | Yes |
| GET | `/public/:anonymousId` | Get public profile | No |

### Phones (`/api/phones`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all live phones | No |
| GET | `/:id` | Get phone details | No |
| POST | `/` | Create phone listing | Yes |
| PUT | `/:id` | Update phone listing | Yes |
| DELETE | `/:id` | Delete phone listing | Yes |
| GET | `/seller/my-phones` | Get seller's phones | Yes |
| GET | `/sold` | Get sold phones | Yes |
| GET | `/purchased` | Get purchased phones | Yes |

### Bids (`/api/bids`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Place a bid | Yes |
| GET | `/phone/:phoneId` | Get bids for phone | No |
| GET | `/user` | Get user's bids | Yes |
| POST | `/:bidId/accept` | Accept a bid (seller) | Yes |

### Reels (`/api/reels`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/all` | Get all reels | No |
| GET | `/:id` | Get reel by ID | No |
| POST | `/` | Upload reel | Yes |
| DELETE | `/:id` | Delete reel | Yes |
| POST | `/:id/like` | Toggle like | Yes |
| GET | `/:id/comments` | Get comments | No |
| POST | `/:id/comments` | Add comment | Yes |
| POST | `/:id/view` | Track view | Optional |

### Admin (`/api/admin`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/stats` | Dashboard statistics | Admin |
| GET | `/users` | List all users | Admin |
| GET | `/users/:id` | User details | Admin |
| DELETE | `/users/:id` | Delete user | Admin |
| PUT | `/users/:id/ban` | Ban/unban user | Admin |
| GET | `/phones` | All phone listings | Admin |
| PUT | `/phones/:id/verify` | Approve/reject phone | Admin |
| GET | `/complaints` | All complaints | Admin |
| PUT | `/complaints/:id` | Update complaint | Admin |

### Complaints (`/api/complaints`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | File complaint | Yes |
| GET | `/my` | User's complaints | Yes |
| GET | `/:id` | Complaint details | Yes |

### Chatbot (`/api/chatbot`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/chat` | Send message | No |

---

## Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  googleId: String,
  anonymousId: String (unique), // USER_XXXXXX
  role: ['user', 'admin'],
  avatar: String,
  phone: String,
  governmentIdProof: String, // Cloudinary URL
  governmentIdType: ['Aadhaar', 'PAN', 'Passport'],
  kycStatus: ['pending', 'verified', 'rejected'],
  walletBalance: Number,
  isBanned: Boolean,
  createdAt: Date
}
```

### Phone
```javascript
{
  seller: ObjectId (ref: User),
  brand: String,
  model: String,
  storage: String,
  ram: String,
  color: String,
  condition: ['Excellent', 'Good', 'Fair', 'Poor'],
  description: String,
  images: [String], // Cloudinary URLs
  minBidPrice: Number,
  currentBid: Number,
  bidCount: Number,
  location: String,
  accessories: {
    charger: Boolean,
    box: Boolean,
    bill: Boolean
  },
  status: ['pending', 'live', 'sold', 'rejected'],
  verificationStatus: ['pending', 'approved', 'rejected'],
  soldTo: ObjectId (ref: User),
  soldPrice: Number,
  soldAt: Date,
  createdAt: Date
}
```

### Bid
```javascript
{
  phone: ObjectId (ref: Phone),
  bidder: ObjectId (ref: User),
  bidAmount: Number,
  status: ['active', 'outbid', 'won', 'lost'],
  isWinning: Boolean,
  timestamp: Date
}
```

### Reel
```javascript
{
  userId: ObjectId (ref: User),
  contentType: ['video', 'images'],
  videoUrl: String,
  thumbnailUrl: String,
  images: [{
    url: String,
    publicId: String
  }],
  description: String,
  duration: Number,
  likes: [ObjectId],
  comments: [{
    userId: ObjectId,
    text: String,
    createdAt: Date
  }],
  views: Number,
  createdAt: Date
}
```

### OTP
```javascript
{
  email: String,
  otp: String,
  type: ['signup', 'reset'],
  verified: Boolean,
  expiresAt: Date, // 10 minutes
  createdAt: Date
}
```

### Complaint
```javascript
{
  complainant: ObjectId (ref: User),
  againstUser: ObjectId (ref: User),
  phone: ObjectId (ref: Phone),
  type: ['fraud', 'spam', 'inappropriate', 'other'],
  description: String,
  status: ['pending', 'in_progress', 'resolved', 'dismissed'],
  adminNotes: String,
  createdAt: Date,
  resolvedAt: Date
}
```

---

## Authentication Flow

### Email Registration
```
1. User enters name, email, password, government ID
2. Frontend calls POST /api/v2/auth/signup/send-otp
3. Server generates 6-digit OTP, saves to DB
4. Server sends OTP via Gmail SMTP
5. User enters OTP
6. Frontend calls POST /api/v2/auth/signup/verify-otp
7. Server verifies OTP, creates user with anonymous ID
8. Server returns JWT token
9. Frontend stores token in localStorage
```

### Google OAuth
```
1. User clicks "Continue with Google"
2. Redirect to Google OAuth consent screen
3. Google redirects to /api/auth/google/callback
4. Server creates/finds user, generates JWT
5. Redirect to frontend with token
6. If new user, prompt for government ID upload
```

### JWT Structure
```javascript
{
  userId: "ObjectId",
  iat: timestamp,
  exp: timestamp + 7 days
}
```

---

## Real-time Features

### WebSocket Events

#### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join-phone` | `{ phoneId }` | Join phone room for bid updates |
| `leave-phone` | `{ phoneId }` | Leave phone room |
| `new-bid` | `{ phoneId, amount }` | Place new bid |

#### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `bid-update` | `{ phoneId, bid, currentBid }` | New bid placed |
| `bid-accepted` | `{ phoneId, winnerId }` | Bid accepted by seller |
| `phone-sold` | `{ phoneId }` | Phone marked as sold |

### Socket.io Implementation
```javascript
// Server
io.on('connection', (socket) => {
  socket.on('join-phone', (phoneId) => {
    socket.join(`phone-${phoneId}`);
  });
  
  socket.on('new-bid', async (data) => {
    // Validate and save bid
    io.to(`phone-${data.phoneId}`).emit('bid-update', {
      phoneId: data.phoneId,
      bid: newBid,
      currentBid: phone.currentBid
    });
  });
});
```

---

## Deployment

### Frontend (Vercel)
```bash
# vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}

# Environment Variables
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### Backend (Render)
```bash
# Environment Variables
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CLIENT_URL=https://your-frontend.vercel.app
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
REDIS_URL=redis://...
GEMINI_API_KEY=...
```

### Build Commands
```bash
# Frontend
cd client && npm install && npm run build

# Backend
cd server && npm install && npm start
```

---

## File Structure

```
phonebid/
├── client/                    # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── auth/
│   │   │   ├── chatbot/
│   │   │   ├── common/
│   │   │   └── reels/
│   │   ├── config/            # Environment config
│   │   ├── context/           # React Context (Auth)
│   │   ├── pages/             # Page components
│   │   │   ├── admin/         # Admin dashboard
│   │   │   └── ...
│   │   ├── services/          # API services
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                    # Node.js Backend
│   ├── config/                # DB & Cloudinary config
│   ├── controllers/           # Route handlers
│   ├── middleware/            # Auth & validation
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   ├── scripts/               # Utility scripts
│   ├── index.js               # Entry point
│   └── package.json
│
└── README.md
```

---

## Security Measures

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: Signed with secret, 7-day expiry
3. **Input Validation**: express-validator on all routes
4. **CORS**: Restricted to frontend domain
5. **Rate Limiting**: On auth endpoints
6. **File Validation**: Type & size checks on uploads
7. **Anonymous IDs**: Real identity hidden from other users
8. **KYC Verification**: Government ID required for trust

---

## Performance Optimizations

1. **Redis Caching**: Session & frequently accessed data
2. **Lazy Loading**: React.lazy for non-critical pages
3. **Image Optimization**: Cloudinary transformations
4. **Database Indexing**: On frequently queried fields
5. **Compression**: gzip on API responses
6. **CDN**: Cloudinary for media delivery

---

## Future Enhancements

- [ ] Payment Gateway Integration
- [ ] Push Notifications
- [ ] Advanced Search Filters
- [ ] Seller Ratings & Reviews
- [ ] Auction Timer Countdown
- [ ] Mobile App (React Native)
- [ ] Multi-language Support

---

## Support

For technical support or queries:
- Email: support@phonebid.store
- Documentation: This file
- Admin Panel: /admin (admin users only)

---

*Last Updated: December 2024*
*Version: 1.0.0*
