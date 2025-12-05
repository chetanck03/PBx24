# PhoneBid Test Data Setup Guide

## 🎯 What's Been Updated

### 1. **Test Data Seeding Script**
- Created `server/scripts/seedTestData.js`
- Adds 8 sample phones with realistic data
- Creates auctions for each phone
- Includes test user account

### 2. **Marketplace Page - Dark Theme**
- Complete redesign matching your reference image
- Dark background (#0a0a0a)
- Neon yellow accents (#c4ff0d)
- Filters sidebar with toggles
- Hover "Place Bid" button on phone cards
- Professional card layout

## 🚀 How to Add Test Data

### Step 1: Navigate to Server Directory
```bash
cd server
```

### Step 2: Run the Seed Script
```bash
npm run seed
```

This will:
- Clear existing phones and auctions
- Create a test user (email: testuser@phonebid.com, password: Test@123)
- Add 8 sample phones with images
- Create active auctions for each phone

### Step 3: Start the Server
```bash
npm run dev
```

### Step 4: Start the Client
```bash
cd ../client
npm run dev
```

## 📱 Test Data Includes

1. **iPhone 14 Pro Max** - Deep Purple, 256GB, Excellent - ₹65,000
2. **Samsung Galaxy S23 Ultra** - Phantom Black, 512GB, Excellent - ₹65,000
3. **iPhone 14 Pro Max** - Space Black, 128GB, Excellent - ₹65,000
4. **Samsung Galaxy Z3 Ultra** - Cream, 256GB, Good - ₹60,000
5. **iPhone Pixel 8 Pro** - Obsidian, 256GB, Excellent - ₹65,000
6. **iPhone 14 Pro** - Gold, 256GB, Good - ₹55,000
7. **OnePlus 11** - Eternal Green, 256GB, Excellent - ₹45,000
8. **Samsung Galaxy S22 Ultra** - Burgundy, 512GB, Good - ₹50,000

## 🎨 New Marketplace Features

### Filters Sidebar
- **Active Filters** display with tags
- **Price Range** sliders (₹50,000 - ₹50,000)
- **Condition** toggle
- **Brand** toggle
- **Technical Specs** toggle
- **Location** toggle
- **Anonymity Status** toggle
- **Apply Filters** button in neon yellow

### Phone Cards
- Dark theme with border hover effects
- Condition badges (Excellent/Good/Fair)
- Hover "Place Bid" button
- Current bid in neon yellow
- Bid count with user icon
- Anonymous seller ID
- Smooth scale animation on hover

### Design Elements
- Grid background pattern
- Neon yellow (#c4ff0d) primary color
- Dark backgrounds (#0a0a0a, #0f0f0f, #1a1a1a)
- Smooth transitions and hover effects
- Professional typography

## 🔐 Test User Credentials

**Email:** testuser@phonebid.com  
**Password:** Test@123

## 📝 Next Steps

1. Run the seed script to populate test data
2. Browse the marketplace to see the new design
3. Test the filters and search functionality
4. Click on phones to view details
5. Test the bidding functionality

## 🎯 What's Matching Your Design

✅ Dark theme with neon yellow accents  
✅ Filters sidebar with toggles  
✅ Price range sliders  
✅ Phone cards with hover effects  
✅ "Place Bid" button on hover  
✅ Condition badges  
✅ Professional layout and spacing  
✅ Smooth animations and transitions  

## 🔄 Re-seeding Data

If you want to reset the test data:
```bash
cd server
npm run seed
```

This will clear all existing phones and auctions and create fresh test data.
