import Phone from '../models/Phone.js';
import Auction from '../models/Auction.js';

// Get all phones from database with full details
async function getPhoneData() {
  try {
    const phones = await Phone.find({})
      .select('brand model storage ram color condition minBidPrice status location description accessories verificationStatus createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return phones;
  } catch (error) {
    console.error('Error fetching phones:', error);
    return [];
  }
}

// Get auction data
async function getAuctionData() {
  try {
    const auctions = await Auction.find({ status: 'active' })
      .populate('phoneId', 'brand model storage condition minBidPrice')
      .lean();
    return auctions;
  } catch (error) {
    console.error('Error fetching auctions:', error);
    return [];
  }
}

// Get platform statistics
async function getStats() {
  try {
    const totalPhones = await Phone.countDocuments();
    const livePhones = await Phone.countDocuments({ status: 'live' });
    const activeAuctions = await Auction.countDocuments({ status: 'active' });
    
    const brands = await Phone.distinct('brand');
    
    const priceStats = await Phone.aggregate([
      { $match: { minBidPrice: { $gt: 0 } } },
      { $group: {
        _id: null,
        avgPrice: { $avg: '$minBidPrice' },
        minPrice: { $min: '$minBidPrice' },
        maxPrice: { $max: '$minBidPrice' }
      }}
    ]);

    return {
      totalPhones,
      livePhones,
      activeAuctions,
      brands,
      priceRange: priceStats[0] || { avgPrice: 0, minPrice: 0, maxPrice: 0 }
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { totalPhones: 0, livePhones: 0, activeAuctions: 0, brands: [], priceRange: {} };
  }
}

// NLU - Extract intent and entities from user message
function parseUserIntent(message) {
  const lowerMsg = message.toLowerCase();
  
  // Intent detection
  let intent = 'general';
  let entities = {
    brand: null,
    priceRange: null,
    condition: null,
    storage: null
  };

  // Detect intent
  if (lowerMsg.includes('available') || lowerMsg.includes('show') || lowerMsg.includes('list') || 
      lowerMsg.includes('what phones') || lowerMsg.includes('which phones') || lowerMsg.includes('phones')) {
    intent = 'list_phones';
  } else if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('cheap') || 
             lowerMsg.includes('expensive') || lowerMsg.includes('budget') || lowerMsg.includes('under') ||
             lowerMsg.includes('below') || lowerMsg.includes('above')) {
    intent = 'price_query';
  } else if (lowerMsg.includes('how') && (lowerMsg.includes('auction') || lowerMsg.includes('bid') || lowerMsg.includes('work'))) {
    intent = 'how_auction';
  } else if (lowerMsg.includes('sell') || lowerMsg.includes('listing') || lowerMsg.includes('create')) {
    intent = 'how_sell';
  } else if (lowerMsg.includes('buy') || lowerMsg.includes('purchase')) {
    intent = 'how_buy';
  } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
    intent = 'greeting';
  } else if (lowerMsg.includes('thank')) {
    intent = 'thanks';
  } else if (lowerMsg.includes('help')) {
    intent = 'help';
  } else if (lowerMsg.includes('feature') || lowerMsg.includes('spec') || lowerMsg.includes('detail')) {
    intent = 'phone_features';
  }

  // Extract brand entities - comprehensive list
  const brandMappings = {
    'iphone': 'Apple', 'apple': 'Apple',
    'samsung': 'Samsung', 'galaxy': 'Samsung',
    'oneplus': 'OnePlus', 'one plus': 'OnePlus',
    'xiaomi': 'Xiaomi', 'mi': 'Xiaomi',
    'redmi': 'Redmi',
    'poco': 'Poco',
    'realme': 'Realme',
    'oppo': 'Oppo',
    'vivo': 'Vivo',
    'google': 'Google', 'pixel': 'Google',
    'nothing': 'Nothing',
    'motorola': 'Motorola', 'moto': 'Motorola',
    'nokia': 'Nokia',
    'huawei': 'Huawei',
    'honor': 'Honor',
    'asus': 'Asus', 'rog': 'Asus',
    'lenovo': 'Lenovo',
    'sony': 'Sony', 'xperia': 'Sony',
    'lg': 'LG',
    'htc': 'HTC',
    'iqoo': 'iQOO',
    'tecno': 'Tecno',
    'infinix': 'Infinix',
    'lava': 'Lava',
    'micromax': 'Micromax'
  };
  
  for (const [keyword, brandName] of Object.entries(brandMappings)) {
    if (lowerMsg.includes(keyword)) {
      entities.brand = brandName.toLowerCase();
      break;
    }
  }

  // Extract price range
  const priceMatch = lowerMsg.match(/(\d+)[k]?\s*(to|-)?\s*(\d+)?[k]?/);
  if (priceMatch) {
    let minPrice = parseInt(priceMatch[1]);
    if (lowerMsg.includes('k') || minPrice < 1000) minPrice *= 1000;
    entities.priceRange = { min: 0, max: minPrice };
    
    if (lowerMsg.includes('above') || lowerMsg.includes('over') || lowerMsg.includes('more than')) {
      entities.priceRange = { min: minPrice, max: Infinity };
    }
  }

  // Extract condition
  if (lowerMsg.includes('excellent') || lowerMsg.includes('new') || lowerMsg.includes('mint')) {
    entities.condition = 'Excellent';
  } else if (lowerMsg.includes('good')) {
    entities.condition = 'Good';
  } else if (lowerMsg.includes('fair')) {
    entities.condition = 'Fair';
  }

  // Extract storage
  const storageMatch = lowerMsg.match(/(\d+)\s*(gb|tb)/i);
  if (storageMatch) {
    entities.storage = storageMatch[1] + storageMatch[2].toUpperCase();
  }

  return { intent, entities };
}

// Filter phones based on entities
function filterPhones(phones, entities) {
  let filtered = [...phones];

  if (entities.brand) {
    filtered = filtered.filter(p => 
      p.brand?.toLowerCase().includes(entities.brand) || 
      p.model?.toLowerCase().includes(entities.brand)
    );
  }

  if (entities.priceRange) {
    filtered = filtered.filter(p => {
      const price = p.minBidPrice || 0;
      return price >= entities.priceRange.min && price <= entities.priceRange.max;
    });
  }

  if (entities.condition) {
    filtered = filtered.filter(p => 
      p.condition?.toLowerCase() === entities.condition.toLowerCase()
    );
  }

  if (entities.storage) {
    filtered = filtered.filter(p => 
      p.storage?.toLowerCase().includes(entities.storage.toLowerCase())
    );
  }

  return filtered;
}

// Format phone list for response
function formatPhoneList(phones, limit = 5, searchedBrand = null, allPhones = []) {
  if (phones.length === 0) {
    // Get available brands for suggestion
    const availableBrands = [...new Set(allPhones.map(p => p.brand))].filter(Boolean);
    
    if (searchedBrand) {
      const brandName = searchedBrand.charAt(0).toUpperCase() + searchedBrand.slice(1);
      let response = `Sorry, we don't have any ${brandName} phones available right now.\n\n`;
      response += `📢 But don't worry! New phones are listed daily.\n\n`;
      
      if (availableBrands.length > 0) {
        response += `Currently available brands:\n`;
        availableBrands.slice(0, 6).forEach(brand => {
          response += `• ${brand}\n`;
        });
        response += `\nWould you like to see phones from any of these brands?`;
      } else {
        response += `Check back soon or browse the Marketplace for the latest listings!`;
      }
      return response;
    }
    
    return "No phones found matching your criteria. Try adjusting your filters or check the Marketplace for all available phones!";
  }

  const displayPhones = phones.slice(0, limit);
  let response = `Found ${phones.length} phone(s):\n\n`;

  displayPhones.forEach((phone, i) => {
    response += `${i + 1}. ${phone.brand} ${phone.model}\n`;
    response += `   Storage: ${phone.storage || 'N/A'}`;
    if (phone.ram) response += ` | RAM: ${phone.ram}`;
    response += `\n`;
    response += `   Condition: ${phone.condition || 'N/A'}\n`;
    response += `   Min Bid: ₹${(phone.minBidPrice || 0).toLocaleString()}\n`;
    response += `   Location: ${phone.location || 'N/A'}\n`;
    if (phone.accessories) {
      const acc = [];
      if (phone.accessories.charger) acc.push('Charger');
      if (phone.accessories.box) acc.push('Box');
      if (phone.accessories.bill) acc.push('Bill');
      if (acc.length > 0) response += `   Includes: ${acc.join(', ')}\n`;
    }
    response += '\n';
  });

  if (phones.length > limit) {
    response += `...and ${phones.length - limit} more. Visit the Marketplace to see all!`;
  }

  return response;
}

// Generate response based on intent
async function generateResponse(intent, entities, phones, stats) {
  switch (intent) {
    case 'greeting':
      return `Hello! Welcome to PhoneBid Assistant!\n\nI can help you with:\n- Finding phones (e.g., "Show me iPhones")\n- Price queries (e.g., "Phones under 20000")\n- Platform info (e.g., "How do auctions work?")\n\nCurrently we have ${stats.totalPhones} phones listed. How can I help you today?`;

    case 'thanks':
      return "You're welcome! Feel free to ask if you need anything else. Happy bidding!";

    case 'help':
      return `Here's what I can help you with:\n\n[Find Phones]\n- "Show me all phones"\n- "Show me Samsung phones"\n- "Phones under 15000"\n- "iPhones in excellent condition"\n\n[Price Queries]\n- "What's the cheapest phone?"\n- "Phones between 10k to 20k"\n\n[Platform Help]\n- "How do auctions work?"\n- "How to sell my phone?"\n- "How to buy a phone?"\n\nJust type your question!`;

    case 'list_phones':
    case 'phone_features':
      const filteredPhones = filterPhones(phones, entities);
      return formatPhoneList(filteredPhones, 5, entities.brand, phones);

    case 'price_query':
      const priceFiltered = filterPhones(phones, entities);
      if (priceFiltered.length === 0) {
        let priceResponse = `No phones found in that price range.\n\n`;
        priceResponse += `📊 Our current price range: ₹${stats.priceRange.minPrice?.toLocaleString() || 0} - ₹${stats.priceRange.maxPrice?.toLocaleString() || 0}\n\n`;
        priceResponse += `Try adjusting your budget or check out all available phones in the Marketplace!`;
        return priceResponse;
      }
      return formatPhoneList(priceFiltered, 5, entities.brand, phones);

    case 'how_auction':
      return `How Auctions Work on PhoneBid:\n\n1. Browse - Find phones you like in the Marketplace\n\n2. Place Bid - Enter your bid amount (must be higher than current bid)\n\n3. Watch - Monitor the auction until it ends\n\n4. Win - If you're the highest bidder when time runs out, you win!\n\n5. Complete - Arrange payment and pickup with the seller\n\nTips:\n- Set a maximum budget before bidding\n- Watch the auction end time\n- Higher bids have better chances\n\nCurrently ${stats.activeAuctions} active auctions!`;

    case 'how_sell':
      return `How to Sell Your Phone:\n\n1. Sign Up/Login - Create an account if you haven't\n\n2. Complete KYC - Verify your identity for secure transactions\n\n3. Create Listing - Click "Sell Phone" in the navbar\n\n4. Add Details:\n   - Phone brand & model\n   - Storage & RAM\n   - Condition (Excellent/Good/Fair/Poor)\n   - Upload 2-6 photos\n   - Set minimum bid price\n   - Add description\n\n5. Submit - Wait for admin approval\n\n6. Go Live - Once approved, your auction starts!\n\nTip: Set a competitive minimum bid to attract more buyers!`;

    case 'how_buy':
      return `How to Buy a Phone:\n\n1. Browse Marketplace - View all available phones\n\n2. Filter & Search - Find phones by brand, price, condition\n\n3. View Details - Check photos, specs, and seller info\n\n4. Place Bid - Enter your bid amount\n\n5. Win Auction - Be the highest bidder when time ends\n\n6. Complete Purchase - Arrange payment with seller\n\nTips:\n- Check phone condition carefully\n- Read the description\n- Ask questions before bidding\n\nReady to start? Check out the Marketplace!`;

    default:
      // Try to find relevant phones based on any keywords
      const defaultFiltered = filterPhones(phones, entities);
      
      // If user asked about a specific brand but none found
      if (entities.brand && defaultFiltered.length === 0) {
        return formatPhoneList(defaultFiltered, 5, entities.brand, phones);
      }
      
      if (defaultFiltered.length > 0 && defaultFiltered.length < phones.length) {
        return formatPhoneList(defaultFiltered, 5, entities.brand, phones);
      }
      
      return `I'm here to help!\n\nQuick Stats:\n- Total Phones: ${stats.totalPhones}\n- Live Auctions: ${stats.activeAuctions}\n- Brands: ${stats.brands.slice(0, 5).join(', ') || 'Various'}\n- Price Range: ₹${stats.priceRange.minPrice?.toLocaleString() || 0} - ₹${stats.priceRange.maxPrice?.toLocaleString() || 0}\n\nTry asking:\n- "Show me all phones"\n- "iPhones under 30000"\n- "How do auctions work?"\n- "How to sell my phone?"`;
  }
}

// Main chat function
export async function chat(userMessage) {
  try {
    // Fetch real-time data from database
    const [phones, stats] = await Promise.all([
      getPhoneData(),
      getStats()
    ]);

    // Parse user intent and entities
    const { intent, entities } = parseUserIntent(userMessage);
    
    console.log('Chat - Intent:', intent, 'Entities:', entities);

    // Generate response
    const response = await generateResponse(intent, entities, phones, stats);

    return {
      success: true,
      message: response
    };
  } catch (error) {
    console.error('Chatbot error:', error);
    return {
      success: false,
      message: "I'm having trouble right now. Please try again or visit the Marketplace directly to browse phones."
    };
  }
}

// Export phone data API for direct access
export async function getPhoneDataAPI() {
  const phones = await getPhoneData();
  const stats = await getStats();
  return { phones, stats };
}

export default { chat, getPhoneDataAPI };
