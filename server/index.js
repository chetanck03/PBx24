import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import enhancedAuthRoutes from './routes/enhancedAuth.js';
import userRoutes from './routes/users.js';
import phoneRoutes from './routes/phones.js';
import auctionRoutes from './routes/auctions.js';
import bidRoutes from './routes/bids.js';
import transactionRoutes from './routes/transactions.js';
import adminRoutes from './routes/admin.js';
import complaintRoutes from './routes/complaints.js';
import listingRoutes from './routes/listings.js'; // Keep for backward compatibility

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = createServer(app);

// Setup Socket.IO
const allowedOrigins = [
  "http://localhost:5173",
  "https://p-bx24.vercel.app",
  process.env.CLIENT_URL
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    console.log('CORS Origin:', origin);
    console.log('Allowed Origins:', allowedOrigins);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS Error: Origin not allowed:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('Origin')}`);
  next();
});

// Increase payload size limit for image uploads (base64 encoded images)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/v2/auth', enhancedAuthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/phones', phoneRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/listings', listingRoutes); // Keep for backward compatibility

// Default route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Phone Bid Marketplace API is running!'
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join listing room for real-time updates
  socket.on('join_listing', (listingId) => {
    socket.join(`listing_${listingId}`);
    console.log(`User ${socket.id} joined listing ${listingId}`);
  });

  // Leave listing room
  socket.on('leave_listing', (listingId) => {
    socket.leave(`listing_${listingId}`);
    console.log(`User ${socket.id} left listing ${listingId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Import error handlers
import { errorHandler, notFound } from './middleware/errorHandler.js';

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
