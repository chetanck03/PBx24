# API Quick Reference Guide

## Base URL: `http://localhost:3000`

---

## 📋 Quick API List

### Authentication (No Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/google` | Login/Register with Google OAuth |
| POST | `/api/auth/logout` | Logout user |

### Authentication (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get current user profile |

---

### Listings (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/listings` | Get all active listings (with filters) |
| GET | `/api/listings/:id` | Get single listing with bids |

### Listings (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/listings` | Create new listing |
| GET | `/api/listings/my-listings` | Get user's listings |
| PUT | `/api/listings/:id` | Update listing (no bids only) |
| DELETE | `/api/listings/:id` | Delete listing (no bids only) |

---

### Bids (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bids/listing/:listingId` | Get all bids for a listing |

### Bids (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bids` | Place a bid |
| GET | `/api/bids/my-bids` | Get user's bids |
| PUT | `/api/bids/:bidId/select` | Select winning bid (seller only) |

---

### Admin (Admin Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/transactions` | Get all transactions |
| PUT | `/api/admin/transactions/:id/approve` | Approve transaction |
| PUT | `/api/admin/transactions/:id/flag` | Flag transaction |
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/statistics` | Get platform statistics |

---

## 🔑 Authentication Header

For protected endpoints, add this header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📝 Common Request Bodies

### Login
```json
{
  "googleId": "123456789",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://example.com/avatar.jpg"
}
```

### Create Listing
```json
{
  "title": "iPhone 14 Pro Max",
  "description": "Excellent condition",
  "brand": "Apple",
  "model": "iPhone 14 Pro Max",
  "condition": "like-new",
  "startingPrice": 800,
  "auctionDuration": 72,
  "specifications": {
    "storage": "256GB",
    "color": "Space Black"
  }
}
```

### Place Bid
```json
{
  "listingId": "507f1f77bcf86cd799439011",
  "amount": 950
}
```

### Approve/Flag Transaction
```json
{
  "adminNotes": "Transaction verified"
}
```

---

## 🔍 Common Query Parameters

### Get Listings
```
?page=1&limit=12&search=iPhone&condition=like-new&brand=Apple
```

### Get Transactions (Admin)
```
?status=pending&page=1&limit=10
```

### Get Users (Admin)
```
?role=user&page=1&limit=10
```

---

## ✅ Success Response Format
```json
{
  "success": true,
  "data": { ... }
}
```

## ❌ Error Response Format
```json
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```

---

## 🚀 Testing Order

1. **Login** → Get token
2. **Create Listing** → Get listing ID
3. **Get Listings** → View all listings
4. **Place Bid** → Bid on a listing (different user)
5. **Select Winner** → Seller selects winning bid
6. **Admin Actions** → Manage transactions (admin user)

---

## 📊 Data Models

### Condition Values
- `new`
- `like-new`
- `good`
- `fair`

### Listing Status
- `active`
- `sold`
- `expired`

### Bid Status
- `winning`
- `outbid`
- `selected`

### Transaction Status
- `pending`
- `approved`
- `completed`
- `flagged`

### User Roles
- `user`
- `admin`

---

## 🔗 Postman Collection Import

To quickly test all APIs:

1. Open Postman
2. Click **Import**
3. Create requests for each endpoint listed above
4. Set up environment variables:
   - `base_url`: `http://localhost:3000`
   - `token`: (set after login)
   - `admin_token`: (set after admin login)

---

For detailed documentation with full request/response examples, see **POSTMAN_API_GUIDE.md**
