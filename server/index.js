import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import listingRoutes from './routes/listings.js';
import bidRoutes from './routes/bids.js';
import adminRoutes from './routes/admin.js';

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

// Handle preflight requests
app.options('*', cors());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('Origin')}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/admin', adminRoutes);

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: { message: 'Something went wrong!' }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Route not found' }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
