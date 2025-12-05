# AI Chatbot Module Documentation

A rule-based NLU chatbot for PhoneBid Marketplace that fetches real-time phone data from MongoDB.

## Features

- **Real-time Database Access** - Fetches live phone listings from MongoDB
- **Natural Language Understanding** - Parses user intent and extracts entities
- **Smart Filtering** - Filter phones by brand, price, condition, storage
- **Platform Knowledge** - Answers questions about auctions, buying, selling
- **No External API Required** - Works without Gemini/OpenAI API keys

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/chatbot/health` | ❌ | Health check with phone count |
| GET | `/api/chatbot/phones` | ❌ | Get all phones and stats |
| GET | `/api/chatbot/info` | ✅ | Get chatbot capabilities |
| POST | `/api/chatbot/message` | ✅ | Send message to chatbot |

### GET /api/chatbot/phones

Returns real-time phone data from database:

```json
{
  "success": true,
  "data": {
    "phones": [
      {
        "brand": "Apple",
        "model": "iPhone 13",
        "storage": "128GB",
        "ram": "4GB",
        "condition": "Excellent",
        "minBidPrice": 45000,
        "location": "Mumbai",
        "accessories": { "charger": true, "box": true, "bill": false }
      }
    ],
    "stats": {
      "totalPhones": 15,
      "livePhones": 8,
      "activeAuctions": 5,
      "brands": ["Apple", "Samsung", "OnePlus"],
      "priceRange": { "minPrice": 5000, "maxPrice": 80000, "avgPrice": 25000 }
    },
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### POST /api/chatbot/message

Send a message and get a response:

```json
// Request
{
  "message": "Show me iPhones under 50000"
}

// Response
{
  "success": true,
  "data": {
    "message": "Found 3 phone(s):\n\n📱 1. Apple iPhone 13...",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Supported Intents

| Intent | Example Queries |
|--------|-----------------|
| `list_phones` | "Show me all phones", "What phones are available?" |
| `price_query` | "Phones under 20000", "Cheap phones", "Budget phones" |
| `how_auction` | "How do auctions work?", "How to bid?" |
| `how_sell` | "How to sell my phone?", "Create listing" |
| `how_buy` | "How to buy?", "How to purchase?" |
| `phone_features` | "Phone specs", "Phone details" |
| `greeting` | "Hello", "Hi", "Hey" |
| `help` | "Help", "What can you do?" |

---

## Entity Extraction

The chatbot extracts these entities from messages:

| Entity | Examples |
|--------|----------|
| Brand | "iPhone", "Samsung", "OnePlus", "Xiaomi", "Pixel" |
| Price | "under 20000", "below 15k", "above 30000" |
| Condition | "excellent", "good", "fair" |
| Storage | "128GB", "256GB", "512GB" |

---

## Example Conversations

**User:** "Show me Samsung phones"
**Bot:** Lists all Samsung phones with details

**User:** "Phones under 15000"
**Bot:** Lists phones with minBidPrice < 15000

**User:** "iPhones in excellent condition"
**Bot:** Lists iPhones with condition = "Excellent"

**User:** "How do auctions work?"
**Bot:** Explains the auction process step by step

---

## File Structure

```
server/
├── services/
│   └── chatbotService.js    # NLU logic & database queries
├── controllers/
│   └── chatbotController.js # Request handlers
└── routes/
    └── chatbot.js           # API routes

client/src/
└── components/
    └── chatbot/
        └── Chatbot.jsx      # Chat UI component
```

---

## How It Works

1. **User sends message** → Frontend calls `/api/chatbot/message`
2. **Parse intent** → NLU extracts intent (list_phones, price_query, etc.)
3. **Extract entities** → Find brand, price range, condition mentions
4. **Query database** → Fetch phones from MongoDB
5. **Filter results** → Apply entity filters to phone list
6. **Generate response** → Format response based on intent
7. **Return to user** → Display formatted phone list or help text

---

## Adding New Intents

To add a new intent, update `chatbotService.js`:

```javascript
// 1. Add intent detection in parseUserIntent()
if (lowerMsg.includes('compare')) {
  intent = 'compare_phones';
}

// 2. Add response generation in generateResponse()
case 'compare_phones':
  return "To compare phones, select multiple phones in the Marketplace...";
```

---

## No External Dependencies

This chatbot works entirely with:
- MongoDB queries for phone data
- Rule-based NLU for intent detection
- Template-based response generation

No API keys required!
