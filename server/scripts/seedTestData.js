import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Phone from '../models/Phone.js';
import User from '../models/User.js';
import Auction from '../models/Auction.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const testPhones = [
  {
    brand: 'Apple',
    model: 'iPhone 14 Pro Max',
    storage: '256GB',
    ram: '6GB',
    color: 'Deep Purple',
    condition: 'Excellent',
    minBidPrice: 65000,
    location: 'Mumbai',
    description: 'Like new condition, barely used for 2 months. All accessories included.',
    images: ['https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=500']
  },
  {
    brand: 'Samsung',
    model: 'Galaxy S23 Ultra',
    storage: '512GB',
    ram: '12GB',
    color: 'Phantom Black',
    condition: 'Excellent',
    minBidPrice: 65000,
    location: 'Delhi',
    description: 'Flagship Samsung phone in pristine condition.',
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500']
  },
  {
    brand: 'Apple',
    model: 'iPhone 14 Pro Max',
    storage: '128GB',
    ram: '6GB',
    color: 'Space Black',
    condition: 'Excellent',
    minBidPrice: 65000,
    location: 'Bangalore',
    description: 'Perfect condition, no scratches.',
    images: ['https://images.unsplash.com/photo-1592286927505-b0c2e0a13e60?w=500']
  },
  {
    brand: 'Samsung',
    model: 'Galaxy Z3 Ultra',
    storage: '256GB',
    ram: '8GB',
    color: 'Cream',
    condition: 'Good',
    minBidPrice: 60000,
    location: 'Pune',
    description: 'Well maintained, minor wear on edges.',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500']
  },
  {
    brand: 'Apple',
    model: 'iPhone Pixel 8 Pro',
    storage: '256GB',
    ram: '12GB',
    color: 'Obsidian',
    condition: 'Excellent',
    minBidPrice: 65000,
    location: 'Hyderabad',
    description: 'Google flagship with amazing camera.',
    images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500']
  },
  {
    brand: 'Apple',
    model: 'iPhone 14 Pro',
    storage: '256GB',
    ram: '6GB',
    color: 'Gold',
    condition: 'Good',
    minBidPrice: 55000,
    location: 'Chennai',
    description: 'Great phone, some minor scratches on back.',
    images: ['https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500']
  },
  {
    brand: 'OnePlus',
    model: 'OnePlus 11',
    storage: '256GB',
    ram: '16GB',
    color: 'Eternal Green',
    condition: 'Excellent',
    minBidPrice: 45000,
    location: 'Kolkata',
    description: 'Flagship killer in mint condition.',
    images: ['https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=500']
  },
  {
    brand: 'Samsung',
    model: 'Galaxy S22 Ultra',
    storage: '512GB',
    ram: '12GB',
    color: 'Burgundy',
    condition: 'Good',
    minBidPrice: 50000,
    location: 'Ahmedabad',
    description: 'S Pen included, great for productivity.',
    images: ['https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500']
  }
];

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Phone.deleteMany({});
    await Auction.deleteMany({});
    console.log('Cleared existing data');

    // Find or create test users
    let testUser = await User.findOne({ email: 'testuser@phonebid.com' });
    if (!testUser) {
      const hashedPassword = await bcrypt.hash('Test@123', 10);
      testUser = await User.create({
        name: 'Test User',
        email: 'testuser@phonebid.com',
        password: hashedPassword,
        phoneNumber: '9876543210',
        governmentIdType: 'Aadhaar',
        governmentIdNumber: 'XXXX-XXXX-1234',
        isVerified: true
      });
      console.log('Created test user');
    }

    // Create phones
    const createdPhones = [];
    for (const phoneData of testPhones) {
      const phone = await Phone.create({
        ...phoneData,
        sellerId: testUser._id,
        anonymousSellerId: `USER_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        auctionStatus: 'active'
      });
      createdPhones.push(phone);

      // Create auction for each phone
      const auctionEndTime = new Date();
      auctionEndTime.setHours(auctionEndTime.getHours() + Math.floor(Math.random() * 48) + 2);

      await Auction.create({
        phoneId: phone._id,
        sellerId: testUser._id,
        anonymousSellerId: phone.anonymousSellerId,
        startingBid: phone.minBidPrice,
        currentBid: phone.minBidPrice + Math.floor(Math.random() * 10000),
        auctionEndTime: auctionEndTime,
        status: 'active',
        totalBids: Math.floor(Math.random() * 20) + 1,
        bids: []
      });
    }

    console.log(`Created ${createdPhones.length} test phones with auctions`);
    console.log('Test data seeded successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
