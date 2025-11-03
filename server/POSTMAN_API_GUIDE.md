# PBx24 API Documentation - Postman Guide

## Base URL
```
http://localhost:3000
```

## Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [Listing APIs](#listing-apis)
3. [Bid APIs](#bid-apis)
4. [Admin APIs](#admin-apis)

---

## Authentication Setup

### Bearer Token Authentication
Most endpoints require authentication. After logging in, you'll receive a JWT token. Add it to your requests:

**Postman Setup:**
1. Go to the **Authorization** tab
2. Select **Type**: `Bearer Token`
3. Paste your token in the **Token** field

---

## Authentication APIs

### 1. Google OAuth Login/Register
**Endpoint:** `POST /api/auth/google`

**Description:** Authenticate user with Google OAuth credentials

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "googleId": "123456789",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://example.com/avatar.jpg",
      "role": "user"
    }
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "message": "Missing required Google OAuth data"
  }
}
```

---

### 2. Get Current User Profile
**Endpoint:** `GET /api/auth/me`

**Description:** Get authenticated user's profile

**Headers:**
```
Authorization: Bearer <your_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://example.com/avatar.jpg",
      "role": "user"
    }
  }
}
```

---

### 3. Logout
**Endpoint:** `POST /api/auth/logout`

**Description:** Logout user (client-side token removal)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

## Listing APIs

### 1. Get All Active Listings
**Endpoint:** `GET /api/listings`

**Description:** Get all active listings with pagination and filters

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)
- `search` (optional): Search by title, brand, or model
- `condition` (optional): Filter by condition (new, like-new, good, fair)
- `brand` (optional): Filter by brand name

**Example Request:**
```
GET /api/listings?page=1&limit=12&search=iPhone&condition=like-new&brand=Apple
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "iPhone 14 Pro Max",
        "description": "Excellent condition, barely used",
        "brand": "Apple",
        "model": "iPhone 14 Pro Max",
        "condition": "like-new",
        "startingPrice": 800,
        "currentHighestBid": 950,
        "auctionEndTime": "2024-12-31T23:59:59.000Z",
        "status": "active",
        "seller": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "John Doe",
          "avatar": "https://example.com/avatar.jpg"
        },
        "createdAt": "2024-10-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pages": 5,
      "total": 60
    }
  }
}
```

---

### 2. Get Single Listing with Bids
**Endpoint:** `GET /api/listings/:id`

**Description:** Get detailed information about a specific listing including all bids

**Example Request:**
```
GET /api/listings/507f1f77bcf86cd799439011
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "listing": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "iPhone 14 Pro Max",
      "description": "Excellent condition, barely used",
      "brand": "Apple",
      "model": "iPhone 14 Pro Max",
      "condition": "like-new",
      "startingPrice": 800,
      "currentHighestBid": 950,
      "auctionEndTime": "2024-12-31T23:59:59.000Z",
      "status": "active",
      "specifications": {
        "storage": "256GB",
        "color": "Space Black"
      },
      "seller": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "avatar": "https://example.com/avatar.jpg",
        "email": "seller@example.com"
      }
    },
    "bids": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "amount": 950,
        "isWinning": true,
        "status": "winning",
        "bidder": {
          "_id": "507f1f77bcf86cd799439014",
          "name": "Jane Smith",
          "avatar": "https://example.com/avatar2.jpg"
        },
        "createdAt": "2024-10-15T14:30:00.000Z"
      }
    ]
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "Listing not found"
  }
}
```

---

### 3. Create New Listing
**Endpoint:** `POST /api/listings`

**Description:** Create a new phone listing (requires authentication)

**Headers:**
```
Authorization: Bearer <your_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "iPhone 14 Pro Max - Space Black",
  "description": "Excellent condition, barely used. Comes with original box and accessories.",
  "brand": "Apple",
  "model": "iPhone 14 Pro Max",
  "condition": "like-new",
  "startingPrice": 800,
  "auctionDuration": 72,
  "specifications": {
    "storage": "256GB",
    "color": "Space Black",
    "ram": "6GB"
  }
}
```

**Field Descriptions:**
- `title` (required): Listing title
- `description` (required): Detailed description
- `brand` (required): Phone brand
- `model` (required): Phone model
- `condition` (required): new, like-new, good, fair
- `startingPrice` (required): Starting bid price in dollars
- `auctionDuration` (required): Duration in hours (e.g., 72 for 3 days)
- `specifications` (optional): Additional specs as key-value pairs

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "listing": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "iPhone 14 Pro Max - Space Black",
      "description": "Excellent condition, barely used. Comes with original box and accessories.",
      "brand": "Apple",
      "model": "iPhone 14 Pro Max",
      "condition": "like-new",
      "startingPrice": 800,
      "currentHighestBid": 0,
      "auctionEndTime": "2024-10-27T10:00:00.000Z",
      "status": "active",
      "specifications": {
        "storage": "256GB",
        "color": "Space Black",
        "ram": "6GB"
      },
      "seller": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "avatar": "https://example.com/avatar.jpg"
      },
      "createdAt": "2024-10-24T10:00:00.000Z"
    }
  }
}
```

---

### 4. Get User's Listings
**Endpoint:** `GET /api/listings/my-listings`

**Description:** Get all listings created by the authenticated user

**Headers:**
```
Authorization: Bearer <your_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "iPhone 14 Pro Max",
        "brand": "Apple",
        "model": "iPhone 14 Pro Max",
        "condition": "like-new",
        "startingPrice": 800,
        "currentHighestBid": 950,
        "status": "active",
        "auctionEndTime": "2024-12-31T23:59:59.000Z",
        "bidCount": 5,
        "createdAt": "2024-10-01T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 5. Update Listing
**Endpoint:** `PUT /api/listings/:id`

**Description:** Update a listing (only if no bids placed, only by seller)

**Headers:**
```
Authorization: Bearer <your_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "iPhone 14 Pro Max - Updated Title",
  "description": "Updated description",
  "startingPrice": 850
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "listing": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "iPhone 14 Pro Max - Updated Title",
      "description": "Updated description",
      "startingPrice": 850
    }
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "message": "Cannot update listing with existing bids"
  }
}
```

---

### 6. Delete Listing
**Endpoint:** `DELETE /api/listings/:id`

**Description:** Delete a listing (only if no bids placed, only by seller)

**Headers:**
```
Authorization: Bearer <your_token>
```

**Example Request:**
```
DELETE /api/listings/507f1f77bcf86cd799439011
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Listing deleted successfully"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "message": "Cannot delete listing with existing bids"
  }
}
```

---

## Bid APIs

### 1. Place a Bid
**Endpoint:** `POST /api/bids`

**Description:** Place a bid on a listing (requires authentication)

**Headers:**
```
Authorization: Bearer <your_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "listingId": "507f1f77bcf86cd799439011",
  "amount": 950
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "bid": {
      "_id": "507f1f77bcf86cd799439013",
      "listing": "507f1f77bcf86cd799439011",
      "amount": 950,
      "isWinning": true,
      "status": "winning",
      "bidder": {
        "_id": "507f1f77bcf86cd799439014",
        "name": "Jane Smith",
        "avatar": "https://example.com/avatar2.jpg"
      },
      "createdAt": "2024-10-24T14:30:00.000Z"
    }
  }
}
```

**Error Responses:**

**400 - Auction Ended:**
```json
{
  "success": false,
  "error": {
    "message": "Auction has ended"
  }
}
```

**400 - Own Listing:**
```json
{
  "success": false,
  "error": {
    "message": "Cannot bid on your own listing"
  }
}
```

**400 - Bid Too Low:**
```json
{
  "success": false,
  "error": {
    "message": "Bid must be at least $951"
  }
}
```

---

### 2. Get Bids for a Listing
**Endpoint:** `GET /api/bids/listing/:listingId`

**Description:** Get all bids for a specific listing

**Example Request:**
```
GET /api/bids/listing/507f1f77bcf86cd799439011
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "bids": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "amount": 950,
        "isWinning": true,
        "status": "winning",
        "bidder": {
          "_id": "507f1f77bcf86cd799439014",
          "name": "Jane Smith",
          "avatar": "https://example.com/avatar2.jpg"
        },
        "createdAt": "2024-10-24T14:30:00.000Z"
      },
      {
        "_id": "507f1f77bcf86cd799439015",
        "amount": 900,
        "isWinning": false,
        "status": "outbid",
        "bidder": {
          "_id": "507f1f77bcf86cd799439016",
          "name": "Bob Johnson",
          "avatar": "https://example.com/avatar3.jpg"
        },
        "createdAt": "2024-10-24T12:00:00.000Z"
      }
    ]
  }
}
```

---

### 3. Get User's Bids
**Endpoint:** `GET /api/bids/my-bids`

**Description:** Get all bids placed by the authenticated user

**Headers:**
```
Authorization: Bearer <your_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "bids": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "amount": 950,
        "isWinning": true,
        "status": "winning",
        "listing": {
          "_id": "507f1f77bcf86cd799439011",
          "title": "iPhone 14 Pro Max",
          "brand": "Apple",
          "model": "iPhone 14 Pro Max",
          "images": [],
          "status": "active",
          "auctionEndTime": "2024-12-31T23:59:59.000Z"
        },
        "createdAt": "2024-10-24T14:30:00.000Z"
      }
    ]
  }
}
```

---

### 4. Select Winning Bid
**Endpoint:** `PUT /api/bids/:bidId/select`

**Description:** Select a winning bid (only by seller, creates transaction)

**Headers:**
```
Authorization: Bearer <your_token>
```

**Example Request:**
```
PUT /api/bids/507f1f77bcf86cd799439013/select
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "bid": {
      "_id": "507f1f77bcf86cd799439013",
      "amount": 950,
      "isSelected": true,
      "status": "selected",
      "isWinning": true
    },
    "transaction": {
      "_id": "507f1f77bcf86cd799439020",
      "listing": "507f1f77bcf86cd799439011",
      "seller": "507f1f77bcf86cd799439012",
      "buyer": "507f1f77bcf86cd799439014",
      "winningBid": "507f1f77bcf86cd799439013",
      "amount": 950,
      "status": "pending",
      "createdAt": "2024-10-24T15:00:00.000Z"
    }
  }
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "error": {
    "message": "Only the seller can select winning bid"
  }
}
```

---

## Admin APIs

**Note:** All admin endpoints require authentication with an admin role.

### Headers for All Admin Requests:
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

---

### 1. Get All Transactions
**Endpoint:** `GET /api/admin/transactions`

**Description:** Get all transactions with pagination and filtering

**Query Parameters:**
- `status` (optional): Filter by status (pending, approved, completed, flagged)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example Request:**
```
GET /api/admin/transactions?status=pending&page=1&limit=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "seller": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "John Doe",
          "email": "seller@example.com",
          "avatar": "https://example.com/avatar.jpg"
        },
        "buyer": {
          "_id": "507f1f77bcf86cd799439014",
          "name": "Jane Smith",
          "email": "buyer@example.com",
          "avatar": "https://example.com/avatar2.jpg"
        },
        "listing": {
          "_id": "507f1f77bcf86cd799439011",
          "title": "iPhone 14 Pro Max",
          "brand": "Apple",
          "model": "iPhone 14 Pro Max",
          "images": []
        },
        "winningBid": {
          "_id": "507f1f77bcf86cd799439013",
          "amount": 950
        },
        "amount": 950,
        "status": "pending",
        "adminNotes": "",
        "createdAt": "2024-10-24T15:00:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 3,
      "total": 25
    }
  }
}
```

---

### 2. Approve Transaction
**Endpoint:** `PUT /api/admin/transactions/:id/approve`

**Description:** Approve a transaction

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body (optional):**
```json
{
  "adminNotes": "Transaction verified and approved"
}
```

**Example Request:**
```
PUT /api/admin/transactions/507f1f77bcf86cd799439020/approve
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "_id": "507f1f77bcf86cd799439020",
      "status": "approved",
      "adminNotes": "Transaction verified and approved",
      "amount": 950
    }
  }
}
```

---

### 3. Flag Transaction
**Endpoint:** `PUT /api/admin/transactions/:id/flag`

**Description:** Flag a suspicious transaction

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body (optional):**
```json
{
  "adminNotes": "Suspicious activity detected - requires investigation"
}
```

**Example Request:**
```
PUT /api/admin/transactions/507f1f77bcf86cd799439020/flag
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "_id": "507f1f77bcf86cd799439020",
      "status": "flagged",
      "adminNotes": "Suspicious activity detected - requires investigation",
      "amount": 950
    }
  }
}
```

---

### 4. Get All Users
**Endpoint:** `GET /api/admin/users`

**Description:** Get all users with pagination and filtering

**Query Parameters:**
- `role` (optional): Filter by role (user, admin)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example Request:**
```
GET /api/admin/users?role=user&page=1&limit=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "email": "user@example.com",
        "name": "John Doe",
        "avatar": "https://example.com/avatar.jpg",
        "role": "user",
        "createdAt": "2024-09-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 5,
      "total": 50
    }
  }
}
```

---

### 5. Get Platform Statistics
**Endpoint:** `GET /api/admin/statistics`

**Description:** Get comprehensive platform statistics

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "admins": 3,
      "regular": 147
    },
    "listings": {
      "total": 250,
      "active": 80,
      "sold": 120,
      "expired": 50
    },
    "bids": {
      "total": 1200,
      "winning": 80,
      "selected": 120
    },
    "transactions": {
      "total": 120,
      "pending": 15,
      "approved": 50,
      "completed": 45,
      "flagged": 10
    },
    "revenue": {
      "total": 125000,
      "thisMonth": 0
    }
  }
}
```

---

## Common Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "message": "No token provided" 
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "message": "Access denied. Admin only."
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "message": "Route not found"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "message": "Something went wrong!"
  }
}
```

---

## Testing Workflow in Postman

### Step 1: Setup Environment
1. Create a new Environment in Postman
2. Add variable: `base_url` = `http://localhost:3000`
3. Add variable: `token` = (leave empty, will be set after login)

### Step 2: Test Authentication
1. **Login with Google OAuth**
   - POST `{{base_url}}/api/auth/google`
   - Copy the token from response
   - Save it to environment variable `token`

2. **Get Profile**
   - GET `{{base_url}}/api/auth/me`
   - Authorization: Bearer `{{token}}`

### Step 3: Test Listings
1. **Create a Listing**
   - POST `{{base_url}}/api/listings`
   - Authorization: Bearer `{{token}}`
   - Use sample request body from above

2. **Get All Listings**
   - GET `{{base_url}}/api/listings`

3. **Get Single Listing**
   - GET `{{base_url}}/api/listings/:id`
   - Replace `:id` with actual listing ID

### Step 4: Test Bidding
1. **Place a Bid**
   - POST `{{base_url}}/api/bids`
   - Authorization: Bearer `{{token}}`
   - Use different user token (not the seller)

2. **Get My Bids**
   - GET `{{base_url}}/api/bids/my-bids`
   - Authorization: Bearer `{{token}}`

### Step 5: Test Admin Features (Admin Token Required)
1. **Get Statistics**
   - GET `{{base_url}}/api/admin/statistics`
   - Authorization: Bearer `{{admin_token}}`

2. **Get All Transactions**
   - GET `{{base_url}}/api/admin/transactions`
   - Authorization: Bearer `{{admin_token}}`

---

## Socket.IO Events (Real-time)

The server also supports WebSocket connections for real-time updates:

### Connection
```javascript
const socket = io('http://localhost:3000');
```

### Events to Emit
- `join_listing` - Join a listing room for updates
  ```javascript
  socket.emit('join_listing', listingId);
  ```

- `leave_listing` - Leave a listing room
  ```javascript
  socket.emit('leave_listing', listingId);
  ```

### Events to Listen
- `connection` - Connected to server
- `disconnect` - Disconnected from server

---

## Notes

1. **Authentication**: Most endpoints require a valid JWT token. Get it from the login endpoint first.

2. **Admin Access**: Admin endpoints require the user to have `role: "admin"` in the database.

3. **Auction Duration**: When creating a listing, `auctionDuration` is in hours (e.g., 72 = 3 days).

4. **Bid Rules**:
   - Cannot bid on your own listing
   - Bid must be higher than current highest bid
   - Cannot bid after auction ends

5. **Listing Updates**: Can only update/delete listings with no bids placed.

6. **Transaction Flow**: 
   - Bid placed → Seller selects winning bid → Transaction created (pending) → Admin approves → Transaction completed

---

## Environment Variables Required

Make sure your `.env` file has:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/phone-bid-marketplace
JWT_SECRET=your-super-secret-jwt-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

**Created:** October 2024  
**Version:** 1.0  
**Server Port:** 3000
