import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Phone from '../models/Phone.js';

dotenv.config();

const addLocationToPhones = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all phones without location to have a default location
    const result = await Phone.updateMany(
      { location: { $exists: false } },
      { $set: { location: 'Not Specified' } }
    );

    console.log(`Updated ${result.modifiedCount} phones with location field`);
    
    // Also update phones with empty location
    const result2 = await Phone.updateMany(
      { location: '' },
      { $set: { location: 'Not Specified' } }
    );

    console.log(`Updated ${result2.modifiedCount} phones with empty location`);
    
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

addLocationToPhones();
