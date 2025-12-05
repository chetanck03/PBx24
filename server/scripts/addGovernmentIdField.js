import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const addGovernmentIdField = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all users without governmentIdProof to have an empty string
    const result = await User.updateMany(
      { governmentIdProof: { $exists: false } },
      { $set: { governmentIdProof: '', governmentIdType: '' } }
    );

    console.log(`Updated ${result.modifiedCount} users with governmentIdProof and governmentIdType fields`);
    
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

addGovernmentIdField();
