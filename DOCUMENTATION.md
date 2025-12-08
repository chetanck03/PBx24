# PhoneBid - Complete Application Documentation

## Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Features](#features)
5. [API Endpoints](#api-endpoints)
6. [Database Models](#database-models)
7. [Frontend Pages](#frontend-pages)
8. [Authentication](#authentication)
9. [Environment Variables](#environment-variables)
10. [Deployment](#deployment)

---

## Overview

PhoneBid is a full-stack phone auction marketplace where users can:
- List phones for auction
- Place bids on phones
- Upload reels (videos and image carousels)
- View public profiles
- Manage transactions securely with escrow

---

## Tech Stack

### Frontend
- **React 18** with Vite
- **React Router v6** for routing
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Lucide React** for icons
- **Recharts** for admin analytics

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time updates
- **JWT** for authentication
- **Cloudinary** for media storage
- **Multer** for file uploads

---

## Project Structure

```
phonebid/
├── client/                    # Frontend React application
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── auth/
│   │   │   ├── chatbot/
│   │   │   ├── common/
│   │   │   ├── marketplace/
│   │   │   └── reels/
│   │   ├── context/           # React Context providers
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── config/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   └── package.json
│
├── server/                    # Backend Node.js application
│   ├── config/
│   │   ├── cloudinary.js      # Cloudinary configuration
│   │   └── database.js        # MongoDB connection
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── auctionController.js
│   │   ├── authController.js
│   │   ├── bidController.js
│   │   ├── chatbotController.js
│   │   ├── complaintController.js
│   │   ├── listingController.js
│   │   ├── phoneController.js
│   │   ├── reelController.js
│   │   ├── transactionController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── accessControl.js
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── Auction.js
│   │   ├── Bid.js
│   │   ├── Complaint.js
│   │   ├── Phone.js
│   │   ├── Reel.js
│   │   ├── Transaction.js
│   │   └── User.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── auctions.js
│   │   ├── auth.js
│   │   ├── bids.js
│   │   ├── chatbot.js
│   │   ├── complaints.js
│   │   ├── phones.js
│   │   ├── reels.js
│   │   ├── transactions.js
│   │   └── users.js
│   ├── utils/
│   ├── .env
│   ├── index.js
│   └── package.json
│
└── package.json
```

---

## Features

### 1. User Authentication
- Google OAuth login
- JWT-based session management
- Role-based access (user, admin)
- KYC verification system

### 2. Phone Marketplace
- Create phone listings with images
- Set minimum bid price
- Automatic auction creation on approval
- Location-based filtering (State/City)
- Brand, condition, storage filters
- Real-time bid updates

### 3. Auction System
- Timed auctions (default 7 days)
- Real-time bidding with Socket.IO
- Automatic winner determination
- Bid history tracking

### 4. Reels System
- Upload video reels (max 30 seconds)
- Upload image carousels (up to 10 images)
- Like and comment on reels
- View count tracking
- Clickable user profiles

### 5. Public Profiles
- Instagram-style profile pages
- User statistics (listings, bids, wins)
- Active listings display
- Reels gallery

### 6. Admin Dashboard
- Platform statistics with charts
- User management (KYC review, ban)
- Phone verification (approve/reject)
- Transaction monitoring
- Complaint management
- Real-time analytics

### 7. Transaction & Escrow
- Secure payment holding
- Meeting scheduling
- Transaction completion flow
- Platform commission handling

### 8. Complaint System
- Submit complaints with categories
- Admin response system
- Status tracking

### 9. AI Chatbot
- Platform assistance
- Phone recommendations
- FAQ handling

---

## API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/google` | Google OAuth login |
| POST | `/logout` | User logout |
| GET | `/me` | Get current user |

### Users (`/api/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get user profile |
| PUT | `/profile` | Update profile |
| POST | `/wallet` | Update wallet balance |
| POST | `/kyc` | Submit KYC |
| GET | `/anonymous/:id` | Get user by anonymous ID |
| GET | `/public/:id` | Get public profile with stats |

### Phones (`/api/phones`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all phones (with filters) |
| GET | `/:id` | Get phone by ID |
| POST | `/` | Create phone listing |
| PUT | `/:id` | Update phone |
| DELETE | `/:id` | Delete phone |
| GET | `/seller/my-phones` | Get seller's phones |
| GET | `/seller/sold` | Get sold phones |
| GET | `/user/purchased` | Get purchased phones |

### Auctions (`/api/auctions`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get active auctions |
| GET | `/:id` | Get auction by ID |
| GET | `/phone/:phoneId` | Get auction by phone |
| POST | `/` | Create auction |
| PUT | `/:id/end` | End auction |
| PUT | `/:id/cancel` | Cancel auction |

### Bids (`/api/bids`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Place bid |
| GET | `/auction/:id` | Get auction bids |
| GET | `/my-bids` | Get user's bids |
| POST | `/:id/accept` | Accept bid |

### Reels (`/api/reels`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload video reel |
| POST | `/upload/images` | Upload image carousel |
| GET | `/all` | Get all reels (paginated) |
| GET | `/user/:userId` | Get user's reels |
| GET | `/user/:userId/stats` | Get user reel stats |
| GET | `/my/reels` | Get current user's reels |
| GET | `/:id` | Get reel by ID |
| POST | `/:id/view` | Increment view count |
| DELETE | `/:id` | Delete reel |
| POST | `/:id/like` | Toggle like |
| GET | `/:id/like/status` | Check like status |
| GET | `/:id/comments` | Get comments |
| POST | `/:id/comments` | Add comment |
| DELETE | `/:id/comments/:commentId` | Delete comment |

### Admin (`/api/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get user by ID |
| PUT | `/users/:id/kyc` | Review KYC |
| DELETE | `/users/:id` | Delete user |
| GET | `/phones` | Get all phones |
| GET | `/phones/:id` | Get phone by ID |
| GET | `/phones/:id/bids` | Get phone bids |
| PUT | `/phones/:id/verify` | Verify phone |
| DELETE | `/phones/:id` | Delete phone |
| GET | `/bids` | Get all bids |
| GET | `/transactions` | Get all transactions |
| PUT | `/transactions/:id/notes` | Update notes |
| GET | `/search` | Search by IDs |
| GET | `/statistics` | Get platform stats |
| GET | `/sold-phones` | Get sold phones |
| GET | `/complaints` | Get complaints |
| PUT | `/complaints/:id` | Update complaint |

### Complaints (`/api/complaints`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create complaint |
| GET | `/my-complaints` | Get user complaints |
| GET | `/:id` | Get complaint by ID |
| GET | `/` | Get all complaints |
| PUT | `/:id` | Update complaint |
| DELETE | `/:id` | Delete complaint |

### Chatbot (`/api/chatbot`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/message` | Send message |
| GET | `/info` | Get chatbot info |
| GET | `/phones` | Get phone data |
| GET | `/health` | Health check |

---

## Database Models


### User Model
```javascript
{
  email: String (unique, encrypted),
  name: String,
  avatar: String,
  googleId: String,
  role: String (enum: ['user', 'admin']),
  anonymousId: String (unique, auto-generated),
  phone: String (encrypted),
  address: String (encrypted),
  walletBalance: Number (default: 0),
  kycStatus: String (enum: ['pending', 'verified', 'rejected']),
  isActive: Boolean (default: true),
  isBanned: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Phone Model
```javascript
{
  sellerId: ObjectId (ref: User),
  anonymousSellerId: String,
  brand: String,
  model: String,
  storage: String,
  condition: String (enum: ['Excellent', 'Good', 'Fair']),
  description: String,
  images: [String],
  imei: String (encrypted),
  minBidPrice: Number,
  location: {
    state: String,
    city: String,
    fullAddress: String
  },
  accessories: [String],
  warranty: String,
  purchaseYear: Number,
  status: String (enum: ['pending', 'live', 'sold', 'rejected']),
  verificationStatus: String (enum: ['pending', 'approved', 'rejected']),
  auctionEndTime: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Auction Model
```javascript
{
  phoneId: ObjectId (ref: Phone),
  sellerId: ObjectId (ref: User),
  anonymousSellerId: String,
  startingBid: Number,
  currentBid: Number,
  winnerId: String (encrypted),
  anonymousWinnerId: String,
  totalBids: Number,
  auctionEndTime: Date,
  status: String (enum: ['active', 'ended', 'completed', 'cancelled']),
  createdAt: Date,
  updatedAt: Date
}
```

### Bid Model
```javascript
{
  auctionId: ObjectId (ref: Auction),
  bidderId: String (encrypted),
  anonymousBidderId: String,
  bidAmount: Number,
  isWinning: Boolean,
  timestamp: Date
}
```

### Reel Model
```javascript
{
  userId: ObjectId (ref: User),
  contentType: String (enum: ['video', 'images']),
  // For video
  videoUrl: String,
  thumbnailUrl: String,
  cloudinaryPublicId: String,
  duration: Number (max: 30),
  // For images
  images: [{
    url: String,
    publicId: String
  }],
  description: String (max: 500),
  views: Number,
  likes: [ObjectId (ref: User)],
  comments: [{
    userId: ObjectId (ref: User),
    text: String,
    createdAt: Date
  }],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Model
```javascript
{
  auctionId: ObjectId (ref: Auction),
  phoneId: ObjectId (ref: Phone),
  sellerId: String (encrypted),
  buyerId: String (encrypted),
  anonymousSellerId: String,
  anonymousBuyerId: String,
  finalAmount: Number,
  platformCommission: Number,
  sellerPayout: Number,
  meetingStatus: String,
  escrowStatus: String,
  adminNotes: String,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Complaint Model
```javascript
{
  userId: ObjectId (ref: User),
  category: String,
  subject: String,
  description: String,
  relatedId: String,
  status: String (enum: ['pending', 'in-progress', 'resolved', 'closed']),
  adminResponse: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Frontend Pages

### Public Pages
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | ProfessionalHome | Landing page |
| `/marketplace` | EnhancedMarketplace | Phone listings |
| `/phone/:id` | PhoneDetail | Phone details & bidding |
| `/reels` | Reels | Reels feed |
| `/explore` | Explore | User search & reels discovery |
| `/user/:anonymousId` | PublicProfile | Public user profile |
| `/auth/signin` | Login | Sign in page |
| `/auth/signup` | SignUp | Sign up page |

### Protected Pages (Requires Login)
| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard` | UserDashboard | User dashboard |
| `/profile` | UserProfile | Edit profile |
| `/create-listing` | CreatePhoneListing | Create phone listing |
| `/complaints` | Complaints | Submit/view complaints |

### Admin Pages (Requires Admin Role)
| Route | Component | Description |
|-------|-----------|-------------|
| `/admin` | AdminDashboard | Admin control panel |

---

## Authentication

### Flow
1. User clicks "Sign in with Google"
2. Google OAuth returns token
3. Backend verifies token and creates/finds user
4. JWT token returned to frontend
5. Token stored in localStorage
6. Token sent with all API requests via Authorization header

### JWT Structure
```javascript
{
  userId: String,
  email: String,
  role: String,
  iat: Number,
  exp: Number
}
```

### Protected Routes
- Frontend uses `ProtectedRoute` component
- Backend uses `requireAuth` and `requireAdmin` middleware

---

## Environment Variables

### Client (.env)
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Server (.env)
```env
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## Deployment

### Frontend (Vercel)
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables
5. Deploy

### Backend (Railway/Render)
1. Connect GitHub repository
2. Set start command: `npm start`
3. Add environment variables
4. Deploy

### Database (MongoDB Atlas)
1. Create cluster
2. Create database user
3. Whitelist IP addresses
4. Get connection string

### Media Storage (Cloudinary)
1. Create account
2. Get API credentials
3. Configure upload presets

---

## Key Features Implementation

### 1. Real-time Bidding
- Socket.IO for live updates
- Optimistic UI updates
- Bid validation on server

### 2. Image/Video Upload
- Multer for file handling
- Cloudinary for storage
- Automatic thumbnail generation
- Size and duration validation

### 3. Location Filtering
- State and city selection
- Flexible search (state only or state+city)
- Indian states/cities database

### 4. Admin Analytics
- Recharts for visualizations
- Real-time statistics
- Cached responses (30s TTL)
- Graceful error handling

### 5. Error Handling
- Centralized error middleware
- Retry logic on frontend (2 retries)
- Fallback data for failed requests
- User-friendly error messages

---

## Performance Optimizations

### Frontend
- Lazy loading for non-critical pages
- Image optimization
- Debounced search
- Pagination for lists
- Memoized components

### Backend
- Response compression
- Database connection pooling
- Query optimization with indexes
- Caching for statistics
- Efficient aggregation pipelines

---

## Security Features

1. **Data Encryption**: Sensitive fields encrypted at rest
2. **JWT Authentication**: Secure token-based auth
3. **CORS Configuration**: Restricted origins
4. **Input Validation**: Server-side validation
5. **Rate Limiting**: API rate limits (recommended)
6. **Anonymous IDs**: User privacy protection

---

## Running Locally

### Prerequisites
- Node.js 18+
- MongoDB
- Cloudinary account
- Google OAuth credentials

### Installation
```bash
# Clone repository
git clone <repo-url>

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Development
```bash
# Start server (from server directory)
npm run dev

# Start client (from client directory)
npm run dev
```

### Production Build
```bash
# Build client
cd client
npm run build

# Start server
cd ../server
npm start
```

---

## Support

For issues or questions, please create a GitHub issue or contact the development team.

---

*Last Updated: December 2024*
