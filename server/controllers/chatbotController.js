import { chat, getPhoneDataAPI } from '../services/chatbotService.js';

// Handle chat message
export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Message is required' }
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        error: { message: 'Message too long. Maximum 1000 characters.' }
      });
    }

    console.log('Processing chat message:', message);
    
    const response = await chat(message.trim());

    console.log('Chat response generated successfully');

    res.json({
      success: true,
      data: {
        message: response.message,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Chat controller error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to process message. Please try again.' }
    });
  }
};

// Get chatbot info/status
export const getChatbotInfo = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        name: 'PhoneBid Assistant',
        description: 'AI-powered assistant for PhoneBid Marketplace',
        capabilities: [
          'Browse and search phones from database',
          'Filter by brand, price, condition',
          'Explain how auctions work',
          'Guide through buying and selling process',
          'Provide real-time platform statistics'
        ],
        status: 'online'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get chatbot info' }
    });
  }
};

// Get real-time phone data
export const getPhoneData = async (req, res) => {
  try {
    const data = await getPhoneDataAPI();
    
    res.json({
      success: true,
      data: {
        phones: data.phones,
        stats: data.stats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Phone data error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch phone data' }
    });
  }
};

// Health check
export const testChatbot = async (req, res) => {
  try {
    const data = await getPhoneDataAPI();
    
    res.json({
      success: true,
      data: {
        status: 'online',
        phonesInDB: data.phones.length,
        stats: data.stats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Health check failed', details: error.message }
    });
  }
};
