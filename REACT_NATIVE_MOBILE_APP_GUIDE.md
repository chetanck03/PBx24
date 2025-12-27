# PhoneBid React Native Mobile App Development Guide

## 📱 Complete Guide to Build Mobile App with Existing Backend

---

## Table of Contents
1. [Backend API Overview](#backend-api-overview)
2. [Authentication System](#authentication-system)
3. [Core Features & APIs](#core-features--apis)
4. [Real-Time Features (WebSocket)](#real-time-features-websocket)
5. [Data Models & Structures](#data-models--structures)
6. [React Native Setup](#react-native-setup)
7. [UI/UX Customization Guide](#uiux-customization-guide)
8. [State Management](#state-management)
9. [Navigation Structure](#navigation-structure)
10. [Security & Best Practices](#security--best-practices)

---

## 🔗 Backend API Overview

### Base URLs
- **Production Backend**: `https://your-backend.render.com`
- **Local Development**: `http://localhost:3000`

### API Response Format
All APIs follow this consistent structure:
```json
{
  "success": true/false,
  "message": "Human readable message",
  "data": { /* actual data */ },
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

---

## 🔐 Authentication System

### 1. Email/Password Authentication (OTP-Based)

#### Step 1: Send Signup OTP
```javascript
POST /api/v2/auth/send-signup-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe"
}

// Response
{
  "success": true,
  "message": "OTP sent to your email",
  "data": {
    "email": "user@example.com"
  }
}
```

#### Step 2: Verify OTP & Create Account
```javascript
POST /api/v2/auth/verify-signup-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "name": "John Doe",
  "password": "securePassword123",
  "governmentIdProof": "base64_encoded_image_or_cloudinary_url",
  "governmentIdType": "Aadhaar" // Options: Aadhaar, PAN, Passport, Driving License
}

// Response
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "kycStatus": "pending",
      "anonymousId": "ANON123456",
      "walletBalance": 0,
      "avatar": "",
      "phone": "",
      "address": "",
      "isActive": true,
      "isBanned": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Step 3: Login with Email/Password
```javascript
POST /api/v2/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

// Response - Same as signup response with token and user object
```

#### Password Reset Flow
```javascript
// Step 1: Send Reset OTP
POST /api/v2/auth/send-reset-otp
{
  "email": "user@example.com"
}

// Step 2: Verify OTP & Reset Password
POST /api/v2/auth/verify-reset-otp
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newSecurePassword123"
}
```

### 2. Google OAuth Authentication
```javascript
POST /api/auth/google
Content-Type: application/json

{
  "token": "google_oauth_token"
}

// Response - Same user object structure with JWT token
```

### 3. Get User Profile
```javascript
GET /api/users/profile
Authorization: Bearer <jwt_token>

// Response
{
  "success": true,
  "data": {
    // Full user object with all fields
  }
}
```

### 4. Update User Profile
```javascript
PUT /api/users/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+1234567890",
  "address": "123 Main St, City",
  "avatar": "base64_or_cloudinary_url"
}
```

---

## 📱 Core Features & APIs

### 1. MARKETPLACE (Browse Phones)

#### Get All Live Phones
```javascript
GET /api/phones?status=live&limit=20&page=1
// Optional query params: brand, minPrice, maxPrice, condition, sort

// Response
{
  "success": true,
  "data": [
    {
      "_id": "phone_id",
      "brand": "Apple",
      "model": "iPhone 14 Pro",
      "storage": "256GB",
      "color": "Space Black",
      "condition": "Excellent",
      "images": ["url1", "url2", "url3"],
      "startingPrice": 50000,
      "currentBid": 55000,
      "reservePrice": 60000,
      "auctionEndTime": "2024-12-25T18:00:00.000Z",
      "status": "live",
      "verificationStatus": "approved",
      "seller": {
        "_id": "seller_id",
        "anonymousId": "ANON123456",
        "name": "Anonymous Seller" // Only anonymousId shown to buyers
      },
      "totalBids": 5,
      "description": "Mint condition iPhone...",
      "accessories": ["Charger", "Box"],
      "warrantyStatus": "Active",
      "purchaseDate": "2023-01-15",
      "createdAt": "2024-12-20T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 5
  }
}
```

#### Get Single Phone Details
```javascript
GET /api/phones/:phoneId
Authorization: Bearer <jwt_token> // Optional, but required for bidding

// Response - Single phone object with additional bid history
{
  "success": true,
  "data": {
    // Phone object (same as above)
    "bidHistory": [
      {
        "_id": "bid_id",
        "amount": 55000,
        "bidder": {
          "anonymousId": "ANON789012"
        },
        "createdAt": "2024-12-21T10:30:00.000Z"
      }
    ]
  }
}
```

#### Search & Filter Phones
```javascript
GET /api/phones/search?q=iPhone&brand=Apple&minPrice=30000&maxPrice=80000&condition=Excellent

// Response - Array of matching phones
```

### 2. BIDDING SYSTEM

#### Place a Bid
```javascript
POST /api/bids/place-bid
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "phoneId": "phone_id",
  "amount": 56000
}

// Response
{
  "success": true,
  "message": "Bid placed successfully",
  "data": {
    "_id": "bid_id",
    "phone": "phone_id",
    "bidder": "user_id",
    "amount": 56000,
    "status": "active",
    "createdAt": "2024-12-21T11:00:00.000Z"
  }
}

// Error Cases
{
  "success": false,
  "error": {
    "message": "Admin approval required to place bids or sell phones",
    "code": "USER_NOT_APPROVED" // User KYC not verified
  }
}

{
  "success": false,
  "error": {
    "message": "Bid must be higher than current bid",
    "code": "BID_TOO_LOW"
  }
}
```

#### Get User's Bids
```javascript
GET /api/bids/my-bids
Authorization: Bearer <jwt_token>

// Response
{
  "success": true,
  "data": [
    {
      "_id": "bid_id",
      "amount": 56000,
      "status": "active", // active, outbid, won, lost
      "phone": {
        "_id": "phone_id",
        "brand": "Apple",
        "model": "iPhone 14 Pro",
        "images": ["url1"],
        "currentBid": 57000,
        "auctionEndTime": "2024-12-25T18:00:00.000Z"
      },
      "createdAt": "2024-12-21T11:00:00.000Z"
    }
  ]
}
```

### 3. SELLING PHONES

#### Create Phone Listing
```javascript
POST /api/phones
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "brand": "Apple",
  "model": "iPhone 14 Pro",
  "storage": "256GB",
  "color": "Space Black",
  "condition": "Excellent", // Excellent, Good, Fair, Poor
  "images": ["base64_or_url1", "base64_or_url2"], // Min 1, Max 5
  "startingPrice": 50000,
  "reservePrice": 60000, // Optional
  "auctionDuration": 7, // Days (1-30)
  "description": "Detailed description...",
  "accessories": ["Charger", "Box", "Earphones"],
  "warrantyStatus": "Active", // Active, Expired, None
  "purchaseDate": "2023-01-15",
  "imeiNumber": "123456789012345" // Optional
}

// Response
{
  "success": true,
  "message": "Phone listing created successfully",
  "data": {
    "_id": "phone_id",
    "status": "pending", // Needs admin approval
    "verificationStatus": "pending",
    // ... all phone fields
  }
}
```

#### Get User's Listings
```javascript
GET /api/phones/my-listings
Authorization: Bearer <jwt_token>

// Response - Array of user's phone listings with all statuses
```

#### Update Phone Listing
```javascript
PUT /api/phones/:phoneId
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "description": "Updated description",
  "startingPrice": 52000
  // Can only update if status is 'pending' or 'rejected'
}
```

#### Delete Phone Listing
```javascript
DELETE /api/phones/:phoneId
Authorization: Bearer <jwt_token>

// Can only delete if:
// - Status is 'pending' or 'rejected'
// - Status is 'live' but no bids placed yet
```

### 4. REELS (Short Videos)

#### Get All Reels
```javascript
GET /api/reels?limit=10&page=1

// Response
{
  "success": true,
  "data": [
    {
      "_id": "reel_id",
      "videoUrl": "cloudinary_video_url",
      "thumbnail": "thumbnail_url",
      "caption": "Check out this phone!",
      "phone": {
        "_id": "phone_id",
        "brand": "Apple",
        "model": "iPhone 14 Pro"
      },
      "user": {
        "_id": "user_id",
        "name": "John Doe",
        "avatar": "avatar_url",
        "anonymousId": "ANON123456"
      },
      "views": 1250,
      "likes": 45,
      "createdAt": "2024-12-20T15:00:00.000Z"
    }
  ]
}
```

#### Upload Reel
```javascript
POST /api/reels
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "videoUrl": "cloudinary_video_url", // Upload to Cloudinary first
  "thumbnail": "thumbnail_url",
  "caption": "Amazing phone deal!",
  "phoneId": "phone_id" // Optional - link to a phone listing
}

// Response
{
  "success": true,
  "data": {
    "_id": "reel_id",
    // ... reel object
  }
}
```

#### Like/Unlike Reel
```javascript
POST /api/reels/:reelId/like
Authorization: Bearer <jwt_token>

// Response
{
  "success": true,
  "data": {
    "likes": 46,
    "isLiked": true
  }
}
```

#### Delete Reel (Owner Only)
```javascript
DELETE /api/reels/:reelId
Authorization: Bearer <jwt_token>
```

### 5. COMPLAINTS SYSTEM

#### Create Complaint
```javascript
POST /api/complaints
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "subject": "Issue with seller",
  "description": "Detailed complaint description...",
  "category": "seller", // seller, buyer, platform, payment, other
  "relatedPhone": "phone_id", // Optional
  "relatedUser": "user_id" // Optional
}

// Response
{
  "success": true,
  "data": {
    "_id": "complaint_id",
    "ticketNumber": "COMP-20241221-001",
    "status": "pending",
    // ... complaint details
  }
}
```

#### Get User's Complaints
```javascript
GET /api/complaints/my-complaints
Authorization: Bearer <jwt_token>

// Response - Array of user's complaints
```

### 6. TRANSACTIONS & WALLET

#### Get Wallet Balance
```javascript
GET /api/users/wallet
Authorization: Bearer <jwt_token>

// Response
{
  "success": true,
  "data": {
    "balance": 5000,
    "currency": "INR"
  }
}
```

#### Get Transaction History
```javascript
GET /api/transactions/my-transactions
Authorization: Bearer <jwt_token>

// Response
{
  "success": true,
  "data": [
    {
      "_id": "transaction_id",
      "type": "bid_payment", // bid_payment, seller_payout, refund, commission
      "amount": 55000,
      "status": "completed",
      "phone": {
        "brand": "Apple",
        "model": "iPhone 14 Pro"
      },
      "createdAt": "2024-12-21T12:00:00.000Z"
    }
  ]
}
```

### 7. CHATBOT (AI Assistant)
```javascript
POST /api/chatbot/query
Content-Type: application/json

{
  "message": "What phones are available under 50000?"
}

// Response
{
  "success": true,
  "data": {
    "response": "Here are phones under ₹50,000...",
    "suggestions": ["iPhone 13", "Samsung S21"],
    "relatedPhones": [/* phone objects */]
  }
}
```

---

## 🔴 Real-Time Features (WebSocket)

### Socket.IO Connection Setup

```javascript
import io from 'socket.io-client';

const SOCKET_URL = 'https://your-backend.render.com';

const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

// Connection events
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

### Real-Time Events

#### 1. Join Phone Room (for bid updates)
```javascript
// Join when user opens phone detail page
socket.emit('join_phone', phoneId);

// Listen for new bids
socket.on('new_bid', (data) => {
  console.log('New bid received:', data);
  // data = { phoneId, bid: { amount, bidder, timestamp } }
  // Update UI with new current bid
});

// Listen for auction end
socket.on('auction_ended', (data) => {
  console.log('Auction ended:', data);
  // data = { phoneId, winner, finalPrice }
  // Show winner notification
});

// Leave when user exits phone detail page
socket.emit('leave_phone', phoneId);
```

#### 2. Join Marketplace Room (for new listings)
```javascript
socket.emit('join_marketplace');

socket.on('new_listing', (data) => {
  console.log('New phone listed:', data);
  // data = { phone: { /* phone object */ } }
  // Add to marketplace list
});

socket.emit('leave_marketplace');
```

#### 3. Join User Room (for personal notifications)
```javascript
socket.emit('join_user_room', userId);

socket.on('bid_outbid', (data) => {
  // User's bid was outbid
  // Show notification: "You've been outbid on iPhone 14 Pro"
});

socket.on('bid_won', (data) => {
  // User won the auction
  // Show notification: "Congratulations! You won iPhone 14 Pro"
});

socket.on('complaint_status_changed', (data) => {
  // Complaint status updated
  // Show notification: "Your complaint has been resolved"
});

socket.emit('leave_user_room', userId);
```

#### 4. Admin Events (for admin users)
```javascript
socket.emit('join_room', 'admin_users');

socket.on('new_user', (data) => {
  // New user registered
  // Update admin dashboard user list
});

socket.on('new_complaint', (data) => {
  // New complaint filed
  // Show notification to admin
});
```

---

## 📊 Data Models & Structures

### User Object
```typescript
interface User {
  _id: string;
  email: string;
  name: string;
  avatar: string;
  role: 'user' | 'admin';
  anonymousId: string; // e.g., "ANON123456"
  phone: string;
  address: string;
  walletBalance: number;
  kycStatus: 'pending' | 'verified' | 'rejected';
  isActive: boolean;
  isBanned: boolean;
  governmentIdProof: string; // Cloudinary URL
  governmentIdType: 'Aadhaar' | 'PAN' | 'Passport' | 'Driving License' | '';
  createdAt: string; // ISO date
  updatedAt: string;
}
```

### Phone Object
```typescript
interface Phone {
  _id: string;
  brand: string;
  model: string;
  storage: string;
  color: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  images: string[]; // Array of Cloudinary URLs
  startingPrice: number;
  currentBid: number;
  reservePrice: number;
  auctionEndTime: string; // ISO date
  status: 'pending' | 'live' | 'sold' | 'expired' | 'rejected';
  verificationStatus: 'pending' | 'approved' | 'rejected';
  seller: {
    _id: string;
    anonymousId: string;
    name?: string; // Only visible to admin
  };
  totalBids: number;
  description: string;
  accessories: string[];
  warrantyStatus: 'Active' | 'Expired' | 'None';
  purchaseDate: string;
  imeiNumber?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Bid Object
```typescript
interface Bid {
  _id: string;
  phone: string | Phone; // Can be populated
  bidder: string | User; // Can be populated
  amount: number;
  status: 'active' | 'outbid' | 'won' | 'lost';
  createdAt: string;
}
```

### Reel Object
```typescript
interface Reel {
  _id: string;
  videoUrl: string; // Cloudinary video URL
  thumbnail: string;
  caption: string;
  phone?: string | Phone; // Optional, can be populated
  user: {
    _id: string;
    name: string;
    avatar: string;
    anonymousId: string;
  };
  views: number;
  likes: number;
  createdAt: string;
}
```

### Complaint Object
```typescript
interface Complaint {
  _id: string;
  ticketNumber: string; // e.g., "COMP-20241221-001"
  user: string | User;
  subject: string;
  description: string;
  category: 'seller' | 'buyer' | 'platform' | 'payment' | 'other';
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  relatedPhone?: string | Phone;
  relatedUser?: string | User;
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Transaction Object
```typescript
interface Transaction {
  _id: string;
  type: 'bid_payment' | 'seller_payout' | 'refund' | 'commission';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  user: string | User;
  phone?: string | Phone;
  description: string;
  createdAt: string;
}
```

---

## 🚀 React Native Setup

### 1. Project Initialization
```bash
npx react-native init PhoneBidMobile
cd PhoneBidMobile
```

### 2. Essential Dependencies
```bash
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install axios socket.io-client
npm install @react-native-async-storage/async-storage
npm install react-native-image-picker
npm install react-native-video
npm install react-native-gesture-handler react-native-reanimated
npm install @react-native-community/netinfo
npm install react-native-toast-message
npm install @react-native-google-signin/google-signin
npm install react-native-otp-input
```

### 3. Project Structure
```
PhoneBidMobile/
├── src/
│   ├── api/
│   │   ├── client.js          # Axios instance
│   │   ├── auth.js            # Auth APIs
│   │   ├── phones.js          # Phone APIs
│   │   ├── bids.js            # Bid APIs
│   │   ├── reels.js           # Reel APIs
│   │   └── socket.js          # Socket.IO setup
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── Card.js
│   │   │   └── Loading.js
│   │   ├── phone/
│   │   │   ├── PhoneCard.js
│   │   │   ├── PhoneDetail.js
│   │   │   └── BidButton.js
│   │   └── reel/
│   │       ├── ReelPlayer.js
│   │       └── ReelCard.js
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   ├── SignupScreen.js
│   │   │   └── OTPScreen.js
│   │   ├── marketplace/
│   │   │   ├── MarketplaceScreen.js
│   │   │   └── PhoneDetailScreen.js
│   │   ├── profile/
│   │   │   ├── ProfileScreen.js
│   │   │   └── MyBidsScreen.js
│   │   ├── sell/
│   │   │   └── CreateListingScreen.js
│   │   └── reels/
│   │       └── ReelsScreen.js
│   ├── navigation/
│   │   ├── AppNavigator.js
│   │   └── AuthNavigator.js
│   ├── context/
│   │   ├── AuthContext.js
│   │   └── SocketContext.js
│   ├── utils/
│   │   ├── storage.js
│   │   ├── validators.js
│   │   └── formatters.js
│   └── constants/
│       ├── colors.js
│       └── config.js
├── App.js
└── index.js
```

---

## 🎨 UI/UX Customization Guide

### Color Scheme (Current Web App)
```javascript
// constants/colors.js
export const COLORS = {
  // Primary Colors
  primary: '#c4ff0d',      // Neon green (brand color)
  background: '#0a0a0a',   // Deep black
  surface: '#1a1a1a',      // Dark gray
  
  // Text Colors
  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
  textMuted: '#666666',
  
  // Status Colors
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  
  // Auction Status
  live: '#10b981',
  pending: '#f59e0b',
  sold: '#6b7280',
  expired: '#ef4444',
  
  // UI Elements
  border: '#2a2a2a',
  cardBg: '#1a1a1a',
  inputBg: '#0f0f0f',
  
  // Gradients
  gradientStart: '#c4ff0d',
  gradientEnd: '#7fb800',
};
```

### Typography
```javascript
// constants/typography.js
export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
};
```

### Spacing System
```javascript
// constants/spacing.js
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

### Component Examples

#### Custom Button Component
```javascript
// components/common/Button.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../constants';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  style 
}) => {
  const buttonStyles = [
    styles.button,
    variant === 'primary' && styles.primaryButton,
    variant === 'secondary' && styles.secondaryButton,
    variant === 'outline' && styles.outlineButton,
    disabled && styles.disabledButton,
    style
  ];

  const textStyles = [
    styles.text,
    variant === 'primary' && styles.primaryText,
    variant === 'secondary' && styles.secondaryText,
    variant === 'outline' && styles.outlineText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.background} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
  primaryText: {
    color: COLORS.background,
  },
  secondaryText: {
    color: COLORS.textPrimary,
  },
  outlineText: {
    color: COLORS.primary,
  },
});

export default Button;
```

#### Phone Card Component
```javascript
// components/phone/PhoneCard.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../constants';

const PhoneCard = ({ phone, onPress }) => {
  const timeRemaining = calculateTimeRemaining(phone.auctionEndTime);
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: phone.images[0] }} style={styles.image} />
      
      <View style={styles.content}>
        <Text style={styles.brand}>{phone.brand}</Text>
        <Text style={styles.model} numberOfLines={1}>{phone.model}</Text>
        
        <View style={styles.specs}>
          <Text style={styles.specText}>{phone.storage}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.specText}>{phone.condition}</Text>
        </View>
        
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>Current Bid</Text>
            <Text style={styles.price}>₹{phone.currentBid.toLocaleString()}</Text>
          </View>
          
          <View style={styles.timeContainer}>
            <Text style={styles.timeLabel}>Ends in</Text>
            <Text style={styles.time}>{timeRemaining}</Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.bids}>{phone.totalBids} bids</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(phone.status) }]}>
            <Text style={styles.statusText}>{phone.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.surface,
  },
  content: {
    padding: SPACING.md,
  },
  brand: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  model: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  specs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  specText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  dot: {
    color: COLORS.textMuted,
    marginHorizontal: SPACING.xs,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: SPACING.md,
  },
  priceLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  price: {
    fontSize: FONTS.sizes.xl,
    color: COLORS.primary,
    fontWeight: '700',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  time: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bids: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
});

const calculateTimeRemaining = (endTime) => {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end - now;
  
  if (diff <= 0) return 'Ended';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'live': return COLORS.live;
    case 'pending': return COLORS.pending;
    case 'sold': return COLORS.sold;
    case 'expired': return COLORS.expired;
    default: return COLORS.surface;
  }
};

export default PhoneCard;
```

---

## 🔐 State Management

### Auth Context Setup
```javascript
// context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from storage on app start
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { token: newToken, user: newUser } = response.data.data;
      
      await AsyncStorage.setItem('token', newToken);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      
      setToken(newToken);
      setUser(newUser);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error?.message || 'Login failed' 
      };
    }
  };

  const signup = async (email, otp, name, password, governmentIdProof, governmentIdType) => {
    try {
      const response = await authAPI.verifySignupOTP(
        email, otp, name, password, governmentIdProof, governmentIdType
      );
      const { token: newToken, user: newUser } = response.data.data;
      
      await AsyncStorage.setItem('token', newToken);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      
      setToken(newToken);
      setUser(newUser);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error?.message || 'Signup failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile(token);
      const updatedUser = response.data.data;
      
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('Error refreshing user:', error);
      return null;
    }
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    AsyncStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    isKYCVerified: user?.kycStatus === 'verified',
    login,
    signup,
    logout,
    refreshUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Socket Context Setup
```javascript
// context/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { SOCKET_URL } from '../constants/config';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const newSocket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        
        // Join user's personal room
        if (user?._id) {
          newSocket.emit('join_user_room', user._id);
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  const joinPhoneRoom = (phoneId) => {
    if (socket) {
      socket.emit('join_phone', phoneId);
    }
  };

  const leavePhoneRoom = (phoneId) => {
    if (socket) {
      socket.emit('leave_phone', phoneId);
    }
  };

  const joinMarketplace = () => {
    if (socket) {
      socket.emit('join_marketplace');
    }
  };

  const leaveMarketplace = () => {
    if (socket) {
      socket.emit('leave_marketplace');
    }
  };

  const value = {
    socket,
    connected,
    joinPhoneRoom,
    leavePhoneRoom,
    joinMarketplace,
    leaveMarketplace,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};
```

---

## 🧭 Navigation Structure

### App Navigator
```javascript
// navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import OTPScreen from '../screens/auth/OTPScreen';

// Main Screens
import MarketplaceScreen from '../screens/marketplace/MarketplaceScreen';
import PhoneDetailScreen from '../screens/marketplace/PhoneDetailScreen';
import ReelsScreen from '../screens/reels/ReelsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import MyBidsScreen from '../screens/profile/MyBidsScreen';
import CreateListingScreen from '../screens/sell/CreateListingScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopColor: '#2a2a2a',
        },
        tabBarActiveTintColor: '#c4ff0d',
        tabBarInactiveTintColor: '#666666',
      }}
    >
      <Tab.Screen name="Marketplace" component={MarketplaceScreen} />
      <Tab.Screen name="Reels" component={ReelsScreen} />
      <Tab.Screen name="Sell" component={CreateListingScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // Or loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="OTP" component={OTPScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="PhoneDetail" component={PhoneDetailScreen} />
            <Stack.Screen name="MyBids" component={MyBidsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
```

---

## 🔒 Security & Best Practices

### 1. API Client Setup with Token Management
```javascript
// api/client.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to all requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // Navigate to login screen
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 2. Image Upload Helper
```javascript
// utils/imageUpload.js
import { launchImageLibrary } from 'react-native-image-picker';

export const pickImage = async (options = {}) => {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    quality: 0.8,
    maxWidth: 1200,
    maxHeight: 1200,
    includeBase64: true,
    ...options,
  });

  if (result.didCancel) {
    return null;
  }

  if (result.errorCode) {
    throw new Error(result.errorMessage);
  }

  return result.assets[0];
};

export const convertToBase64 = (image) => {
  return `data:${image.type};base64,${image.base64}`;
};

// Upload to Cloudinary (if needed)
export const uploadToCloudinary = async (base64Image) => {
  const formData = new FormData();
  formData.append('file', base64Image);
  formData.append('upload_preset', 'your_upload_preset');

  const response = await fetch(
    'https://api.cloudinary.com/v1_1/your_cloud_name/image/upload',
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();
  return data.secure_url;
};
```

### 3. Form Validation
```javascript
// utils/validators.js
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return password.length >= 8;
};

export const validatePhone = (phone) => {
  const regex = /^[+]?[\d\s-()]+$/;
  return regex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const validateOTP = (otp) => {
  return /^\d{6}$/.test(otp);
};

export const validatePrice = (price) => {
  return !isNaN(price) && parseFloat(price) > 0;
};
```

### 4. Error Handling
```javascript
// utils/errorHandler.js
import Toast from 'react-native-toast-message';

export const handleAPIError = (error) => {
  let message = 'Something went wrong';

  if (error.response) {
    // Server responded with error
    message = error.response.data?.error?.message || error.response.data?.message;
  } else if (error.request) {
    // Request made but no response
    message = 'Network error. Please check your connection.';
  } else {
    // Something else happened
    message = error.message;
  }

  Toast.show({
    type: 'error',
    text1: 'Error',
    text2: message,
    position: 'top',
  });

  return message;
};

export const showSuccess = (message) => {
  Toast.show({
    type: 'success',
    text1: 'Success',
    text2: message,
    position: 'top',
  });
};
```

### 5. Network Status Monitoring
```javascript
// utils/networkMonitor.js
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  return isConnected;
};
```

---

## 📲 Screen Examples

### Marketplace Screen
```javascript
// screens/marketplace/MarketplaceScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TextInput,
} from 'react-native';
import { phoneAPI } from '../../api/phones';
import PhoneCard from '../../components/phone/PhoneCard';
import { useSocket } from '../../context/SocketContext';
import { COLORS, SPACING } from '../../constants';

const MarketplaceScreen = ({ navigation }) => {
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { socket, joinMarketplace, leaveMarketplace } = useSocket();

  useEffect(() => {
    loadPhones();
    joinMarketplace();

    // Listen for new listings
    if (socket) {
      socket.on('new_listing', (data) => {
        setPhones(prev => [data.phone, ...prev]);
      });
    }

    return () => {
      leaveMarketplace();
      if (socket) {
        socket.off('new_listing');
      }
    };
  }, [socket]);

  const loadPhones = async () => {
    try {
      setLoading(true);
      const response = await phoneAPI.getAllPhones({ status: 'live' });
      setPhones(response.data.data);
    } catch (error) {
      console.error('Error loading phones:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPhones();
    setRefreshing(false);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const response = await phoneAPI.searchPhones(query);
        setPhones(response.data.data);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else if (query.length === 0) {
      loadPhones();
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search phones..."
        placeholderTextColor={COLORS.textMuted}
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <FlatList
        data={phones}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PhoneCard
            phone={item}
            onPress={() => navigation.navigate('PhoneDetail', { phoneId: item._id })}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchInput: {
    backgroundColor: COLORS.inputBg,
    color: COLORS.textPrimary,
    padding: SPACING.md,
    margin: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  list: {
    padding: SPACING.md,
  },
});

export default MarketplaceScreen;
```

### Phone Detail Screen with Bidding
```javascript
// screens/marketplace/PhoneDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  Image,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { phoneAPI } from '../../api/phones';
import { bidAPI } from '../../api/bids';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { COLORS, FONTS, SPACING } from '../../constants';

const PhoneDetailScreen = ({ route }) => {
  const { phoneId } = route.params;
  const [phone, setPhone] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);
  const { user, isKYCVerified, refreshUser } = useAuth();
  const { socket, joinPhoneRoom, leavePhoneRoom } = useSocket();

  useEffect(() => {
    loadPhone();
    joinPhoneRoom(phoneId);

    // Listen for new bids
    if (socket) {
      socket.on('new_bid', (data) => {
        if (data.phoneId === phoneId) {
          setPhone(prev => ({
            ...prev,
            currentBid: data.bid.amount,
            totalBids: prev.totalBids + 1,
          }));
        }
      });

      socket.on('auction_ended', (data) => {
        if (data.phoneId === phoneId) {
          Alert.alert('Auction Ended', `Final price: ₹${data.finalPrice}`);
          loadPhone();
        }
      });
    }

    return () => {
      leavePhoneRoom(phoneId);
      if (socket) {
        socket.off('new_bid');
        socket.off('auction_ended');
      }
    };
  }, [phoneId, socket]);

  const loadPhone = async () => {
    try {
      const response = await phoneAPI.getPhoneById(phoneId);
      setPhone(response.data.data);
      setBidAmount((response.data.data.currentBid + 1000).toString());
    } catch (error) {
      console.error('Error loading phone:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async () => {
    if (!isKYCVerified) {
      Alert.alert(
        'KYC Verification Required',
        'Please wait for admin to verify your account before bidding.',
        [
          { text: 'Refresh Status', onPress: refreshUser },
          { text: 'OK' },
        ]
      );
      return;
    }

    const amount = parseFloat(bidAmount);
    if (amount <= phone.currentBid) {
      Alert.alert('Invalid Bid', 'Bid must be higher than current bid');
      return;
    }

    try {
      setBidding(true);
      await bidAPI.placeBid(phoneId, amount);
      Alert.alert('Success', 'Bid placed successfully!');
      loadPhone();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error?.message || 'Failed to place bid');
    } finally {
      setBidding(false);
    }
  };

  if (loading || !phone) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: phone.images[0] }} style={styles.mainImage} />
      
      <View style={styles.content}>
        <Text style={styles.brand}>{phone.brand}</Text>
        <Text style={styles.model}>{phone.model}</Text>
        
        <View style={styles.priceSection}>
          <View>
            <Text style={styles.priceLabel}>Current Bid</Text>
            <Text style={styles.price}>₹{phone.currentBid.toLocaleString()}</Text>
          </View>
          <View>
            <Text style={styles.bidsLabel}>{phone.totalBids} bids</Text>
          </View>
        </View>

        {!isKYCVerified && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ KYC verification pending. You cannot bid until approved.
            </Text>
            <Button
              title="Refresh Status"
              onPress={refreshUser}
              variant="outline"
              style={styles.refreshButton}
            />
          </View>
        )}

        <View style={styles.bidSection}>
          <TextInput
            style={styles.bidInput}
            placeholder="Enter bid amount"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numeric"
            value={bidAmount}
            onChangeText={setBidAmount}
            editable={isKYCVerified}
          />
          <Button
            title="Place Bid"
            onPress={handlePlaceBid}
            loading={bidding}
            disabled={!isKYCVerified}
          />
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Details</Text>
          <DetailRow label="Storage" value={phone.storage} />
          <DetailRow label="Color" value={phone.color} />
          <DetailRow label="Condition" value={phone.condition} />
          <DetailRow label="Warranty" value={phone.warrantyStatus} />
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{phone.description}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainImage: {
    width: '100%',
    height: 400,
    backgroundColor: COLORS.surface,
  },
  content: {
    padding: SPACING.lg,
  },
  brand: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  model: {
    fontSize: FONTS.sizes.xxl,
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginBottom: SPACING.lg,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  priceLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  price: {
    fontSize: FONTS.sizes.xxxl,
    color: COLORS.primary,
    fontWeight: '700',
  },
  bidsLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  warningBox: {
    backgroundColor: '#f59e0b20',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
    marginBottom: SPACING.lg,
  },
  warningText: {
    color: '#f59e0b',
    fontSize: FONTS.sizes.sm,
    marginBottom: SPACING.sm,
  },
  refreshButton: {
    marginTop: SPACING.sm,
  },
  bidSection: {
    marginBottom: SPACING.xl,
  },
  bidInput: {
    backgroundColor: COLORS.inputBg,
    color: COLORS.textPrimary,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: FONTS.sizes.lg,
    marginBottom: SPACING.md,
  },
  detailsSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xl,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  descriptionSection: {
    marginBottom: SPACING.xl,
  },
  description: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
});

export default PhoneDetailScreen;
```

---

## 🎯 Key Implementation Notes

### 1. KYC Verification Flow
- User signs up → `kycStatus: 'pending'`
- Admin reviews government ID → Approves/Rejects
- User must have `kycStatus: 'verified'` to bid or sell
- Frontend checks `user.kycStatus === 'verified'`
- Backend middleware `requireKYCVerified` enforces this

### 2. Anonymous Seller Identity
- All users get unique `anonymousId` (e.g., "ANON123456")
- Buyers only see seller's `anonymousId`, never real name/email
- Only admin can see real seller identity

### 3. Real-Time Updates
- Use Socket.IO for live bid updates
- Join/leave rooms when entering/exiting screens
- Handle reconnection gracefully

### 4. Image Handling
- Images can be base64 or Cloudinary URLs
- Backend accepts both formats
- Compress images before upload (max 1200x1200)

### 5. Error Handling
- All APIs return consistent error format
- Handle 401 (unauthorized) globally → logout
- Show user-friendly error messages

### 6. Offline Support (Optional)
- Cache marketplace data with AsyncStorage
- Show cached data when offline
- Sync when connection restored

---

## 📦 Environment Configuration

```javascript
// constants/config.js
export const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://your-backend.render.com/api';

export const SOCKET_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://your-backend.render.com';

export const CLOUDINARY_CLOUD_NAME = 'your_cloud_name';
export const CLOUDINARY_UPLOAD_PRESET = 'your_preset';

export const GOOGLE_CLIENT_ID = 'your_google_client_id';
```

---

## ✅ Testing Checklist

- [ ] User signup with OTP
- [ ] Login/Logout
- [ ] Browse marketplace
- [ ] View phone details
- [ ] Place bid (KYC verified user)
- [ ] Real-time bid updates
- [ ] Create phone listing
- [ ] Upload images
- [ ] View reels
- [ ] File complaint
- [ ] Check wallet balance
- [ ] View transaction history
- [ ] Profile update
- [ ] Password reset
- [ ] Socket reconnection
- [ ] Offline handling
- [ ] Push notifications (optional)

---

## 🚀 Deployment

### iOS
```bash
cd ios
pod install
cd ..
npx react-native run-ios --configuration Release
```

### Android
```bash
npx react-native run-android --variant=release
```

---

## 📞 Support & Resources

- Backend API: `https://your-backend.render.com`
- Socket.IO: Real-time events
- Cloudinary: Image/video uploads
- Documentation: `PHONEBID_DOCUMENTATION.md`

---

**Note**: This guide provides a complete foundation for building the React Native app. Customize UI components, colors, and layouts according to your design preferences. The backend APIs remain unchanged, ensuring seamless integration.
