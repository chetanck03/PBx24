import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User, Minimize2, Maximize2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Chatbot = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm PhoneBid Assistant. I can help you find phones, explain how auctions work, and answer questions about the platform. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setLoading(true);

    try {
      const response = await api.post('/chatbot/message', {
        message: userMessage
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.data.message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      let errorContent = "I'm sorry, I encountered an error. Please try again later.";
      
      if (error.response?.status === 401) {
        errorContent = "Your session has expired. Please refresh the page and try again.";
      } else if (error.response?.status === 500) {
        errorContent = "The service is temporarily unavailable. Please try again in a moment.";
      } else if (!navigator.onLine) {
        errorContent = "You appear to be offline. Please check your internet connection.";
      }
      
      const errorMessage = {
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "What phones are available?",
    "How do auctions work?",
    "How to sell my phone?",
    "Show me iPhones"
  ];

  const handleQuickQuestion = (question) => {
    setInput(question);
    setTimeout(() => sendMessage(), 100);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const resetChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hi! I'm PhoneBid Assistant. I can help you find phones, explain how auctions work, and answer questions about the platform. How can I help you today?",
        timestamp: new Date()
      }
    ]);
    setInput('');
  };

  // Don't render if not authenticated - AFTER all hooks
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#c4ff0d] hover:bg-[#d4ff3d] rounded-full shadow-lg shadow-[#c4ff0d]/30 flex items-center justify-center transition-all hover:scale-110 group"
        >
          <MessageCircle className="w-6 h-6 text-black" />
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
            AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`fixed z-50 bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl shadow-2xl transition-all duration-300 ${
            isMinimized 
              ? 'bottom-6 right-6 w-72 h-14' 
              : 'bottom-6 right-6 w-96 h-[600px] max-h-[80vh]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a] bg-[#1a1a1a] rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#c4ff0d] rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">PhoneBid Assistant</h3>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-400">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                className="p-2 hover:bg-[#2a2a2a] rounded-lg transition"
                title="Reset conversation"
              >
                <RefreshCw className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-[#2a2a2a] rounded-lg transition"
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4 text-gray-400" />
                ) : (
                  <Minimize2 className="w-4 h-4 text-gray-400" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-[#2a2a2a] rounded-lg transition"
                title="Close"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-[#1a1a1a] scrollbar-thumb-[#c4ff0d] scrollbar-thumb-rounded-full p-4 space-y-4 h-[calc(100%-140px)]">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user' ? 'bg-[#c4ff0d]' : 'bg-[#2a2a2a]'
                    }`}>
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4 text-black" />
                      ) : (
                        <Bot className="w-4 h-4 text-[#c4ff0d]" />
                      )}
                    </div>
                    <div className={`max-w-[75%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`px-4 py-3 rounded-2xl ${
                        msg.role === 'user' 
                          ? 'bg-[#c4ff0d] text-black rounded-tr-sm' 
                          : msg.isError 
                            ? 'bg-red-500/20 text-red-300 rounded-tl-sm'
                            : 'bg-[#1a1a1a] text-gray-200 rounded-tl-sm'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 block">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                      <Bot className="w-4 h-4 text-[#c4ff0d]" />
                    </div>
                    <div className="bg-[#1a1a1a] px-4 py-3 rounded-2xl rounded-tl-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input - Always visible */}
              <form onSubmit={sendMessage} className="p-4 border-t border-[#2a2a2a]">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything..."
                    maxLength={1000}
                    disabled={loading}
                    className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#c4ff0d] disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="p-3 bg-[#c4ff0d] hover:bg-[#d4ff3d] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 text-black animate-spin" />
                    ) : (
                      <Send className="w-5 h-5 text-black" />
                    )}
                  </button>
                </div>
                {/* Quick Questions - Below input */}
                {messages.length <= 2 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickQuestions.map((q, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleQuickQuestion(q)}
                          className="px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] rounded-full text-xs text-gray-300 transition"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Chatbot;
