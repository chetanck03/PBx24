# PhoneBid - Phone Auction Marketplace

A full-stack web application that enables users to create bidding auctions for their phones and allows other users to place bids. Built with React, Express.js, and MongoDB.

## Features

- **User Authentication**: Google OAuth integration for secure login
- **Phone Listings**: Create detailed phone listings with specifications
- **Real-time Bidding**: Place bids and get real-time updates
- **User Dashboard**: Manage listings and track bids
- **Admin Panel**: Transaction oversight and management
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React 19 with Vite
- Tailwind CSS 4 for styling
- React Router for navigation
- Axios for API calls
- React Hot Toast for notifications
- Lucide React for icons

### Backend
- Express.js 5 with ES modules
- MongoDB with Mongoose
- JWT for authentication
- Socket.IO for real-time features
- Passport.js for Google OAuth
- Multer for file uploads

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd phone-bid-marketplace
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   ```

4. **Set up environment variables**
   
   **Server Environment:**
   ```bash
   cd server
   cp .env.example .env
   ```
   
   Update the server `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/phone-bid-marketplace
   JWT_SECRET=your-super-secret-jwt-key-here
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```
   
   **Client Environment:**
   ```bash
   cd ../client
   cp .env.example .env
   ```
   
   Update the client `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_APP_NAME=PhoneBid
   VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
   ```

5. **Start MongoDB**
   
   Make sure MongoDB is running on your system.

6. **Start the development servers**
   
   Start the backend server:
   ```bash
   cd server
   npm run dev
   ```
   
   In a new terminal, start the frontend:
   ```bash
   cd client
   npm run dev
   ```

7. **Access the application**
   
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Project Structure

```
phone-bid-marketplace/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── config/         # Configuration files
│   │   └── ...
│   └── ...
├── server/                 # Express backend
│   ├── controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── config/            # Configuration files
│   └── ...
├── docs/                  # Documentation
│   ├── requirements.md    # Project requirements
│   ├── design.md         # System design
│   └── tasks.md          # Implementation tasks
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth authentication
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - User logout

### Listings
- `GET /api/listings` - Get all active listings
- `GET /api/listings/:id` - Get specific listing details
- `POST /api/listings` - Create new listing (auth required)
- `GET /api/listings/my-listings` - Get user's listings (auth required)

### Bids
- `POST /api/bids` - Place a new bid (auth required)
- `GET /api/bids/my-bids` - Get user's bids (auth required)
- `GET /api/bids/listing/:listingId` - Get bids for a listing

## Usage

1. **Sign Up/Login**: Use Google OAuth to create an account or sign in
2. **Browse Marketplace**: View available phone listings and their details
3. **Create Listing**: List your phone for auction with detailed specifications
4. **Place Bids**: Bid on phones you're interested in
5. **Manage Dashboard**: Track your listings, bids, and activity
6. **Real-time Updates**: Get instant notifications about bid activity

## Development

### Running Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

### Building for Production
```bash
# Build frontend
cd client
npm run build

# Start production server
cd server
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@phonebid.com or create an issue in the repository.
