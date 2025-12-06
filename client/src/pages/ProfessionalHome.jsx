import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { phoneAPI, reelAPI } from '../services/api';
import Footer from '../components/common/Footer';
import { Play, Plus, Heart, Eye, Loader2 } from 'lucide-react';

const ProfessionalHome = () => {
  const navigate = useNavigate();
  const [featuredPhones, setFeaturedPhones] = useState([]);
  const [reels, setReels] = useState([]);
  const [reelsLoading, setReelsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    // Redirect logged-in users to marketplace
    if (token) {
      navigate('/marketplace');
      return;
    }
    loadFeaturedPhones();
    loadReels();
  }, [navigate]);

  const loadFeaturedPhones = async () => {
    try {
      const res = await phoneAPI.getAllPhones({ limit: 4 });
      setFeaturedPhones(res.data.data.slice(0, 4));
    } catch (error) {
      console.error('Error loading featured phones:', error);
    }
  };

  const loadReels = async () => {
    try {
      setReelsLoading(true);
      const res = await reelAPI.getAllReels(1, 6);
      setReels(res.data.data || []);
    } catch (error) {
      console.error('Error loading reels:', error);
    } finally {
      setReelsLoading(false);
    }
  };

  const handleUploadClick = () => {
    if (!isLoggedIn) {
      navigate('/auth/signin');
    } else {
      navigate('/reels');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative bg-[#0a0a0a] py-20 lg:py-32 overflow-hidden">
        {/* Grid Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, #1a1a1a 1px, transparent 1px),
              linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Gradient Glow Effects */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#c4ff0d] opacity-10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#c4ff0d] opacity-10 blur-3xl rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-4 py-2 mb-8">
                <div className="w-2 h-2 bg-[#c4ff0d] rounded-full"></div>
                <span className="text-gray-400 text-sm">100% Anonymous & Secure</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Buy & Sell Phones
                <span className="block text-[#c4ff0d] mt-2">
                  Anonymously
                </span>
              </h1>
              
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                The world's first anonymous phone marketplace. Bid on phones without revealing your identity. 
                Complete privacy protection with secure escrow transactions.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/marketplace')}
                  className="bg-[#c4ff0d] text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#d4ff3d] transition transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  Browse Marketplace
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => navigate('/auth/signup')}
                  className="bg-[#1a1a1a] border border-[#2a2a2a] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#2a2a2a] transition"
                >
                  Start Selling
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div>
                  <div className="text-3xl font-bold text-[#c4ff0d] mb-1">10,000+</div>
                  <div className="text-sm text-gray-500">Phones Listed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#c4ff0d] mb-1">50,000+</div>
                  <div className="text-sm text-gray-500">Anonymous Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#c4ff0d] mb-1">₹2M+</div>
                  <div className="text-sm text-gray-500">Transactions Completed</div>
                </div>
              </div>
            </div>

            {/* Right Content - Phone Device Mockup */}
            <div className="relative hidden lg:flex justify-center items-center">
              {/* Large background glow - positioned behind everything */}
              <div 
                className="absolute bg-[#c4ff0d] opacity-40 blur-[100px] rounded-full"
                style={{ width: '500px', height: '500px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0 }}
              ></div>
              
              <div className="relative perspective-1000 z-10">
                {/* Floating animation wrapper */}
                <div className="animate-float">
                  {/* Phone Device Frame */}
                  <div className="relative transform-gpu transition-all duration-500 hover:scale-105 flex justify-center">
                    {/* Secondary glow closer to phone */}
                    <div 
                      className="absolute bg-gradient-to-br from-[#c4ff0d] to-[#a8e000] opacity-50 blur-[80px] rounded-full"
                      style={{ width: '380px', height: '600px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: -1 }}
                    ></div>
                    
                    {/* Phone Outer Frame */}
                    <div className="relative w-[340px] h-[680px] bg-gradient-to-br from-[#2a2a2a] via-[#1f1f1f] to-[#1a1a1a] rounded-[3rem] p-3 shadow-2xl border border-[#3a3a3a] z-10">
                      {/* Phone Screen */}
                      <div className="w-full h-full bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden relative">
                        {/* Status Bar */}
                        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#0f0f0f] to-transparent z-10 flex items-center justify-between px-8">
                          <span className="text-white text-xs">9:41</span>
                          <div className="flex gap-1">
                            <div className="w-4 h-4 bg-white rounded-full opacity-80"></div>
                            <div className="w-4 h-4 bg-white rounded-full opacity-60"></div>
                            <div className="w-4 h-4 bg-white rounded-full opacity-40"></div>
                          </div>
                        </div>

                        {/* Screen Content */}
                        <div className="p-6 pt-16">
                          {/* App Header */}
                          <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-[#c4ff0d] rounded-xl flex items-center justify-center shadow-lg shadow-[#c4ff0d]/50">
                              <span className="text-black font-bold text-xl">P</span>
                            </div>
                            <span className="text-white font-semibold text-lg">PhoneBid</span>
                          </div>
                          
                          {/* Bid Cards */}
                          <div className="space-y-4">
                            {[
                              { label: '₹20k', percent: '32%' },
                              { label: '₹25k', percent: '45%' },
                              { label: '₹30k', percent: '23%' }
                            ].map((item, idx) => (
                              <div 
                                key={idx} 
                                className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-4"
                                style={{
                                  animation: `slideIn 0.5s ease-out ${idx * 0.15}s both`
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center">
                                      <svg className="w-5 h-5 text-[#c4ff0d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                    <div>
                                      <div className="text-white font-bold text-base">{item.label}</div>
                                      <div className="text-gray-500 text-xs">Current Bid</div>
                                    </div>
                                  </div>
                                  <div className="text-[#c4ff0d] font-bold text-lg">{item.percent}</div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Anonymous ID Card */}
                          <div className="mt-6 bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-4">
                            <div className="text-gray-500 text-xs mb-2">Anonymous ID</div>
                            <div className="text-white font-mono text-base font-semibold">USER_7X9K...</div>
                          </div>
                        </div>

                        {/* Bottom Indicator */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white opacity-40 rounded-full"></div>
                      </div>

                      {/* Phone Buttons */}
                      <div className="absolute right-0 top-32 w-1 h-12 bg-[#1a1a1a] rounded-l"></div>
                      <div className="absolute right-0 top-48 w-1 h-16 bg-[#1a1a1a] rounded-l"></div>
                      <div className="absolute left-0 top-40 w-1 h-8 bg-[#1a1a1a] rounded-r"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Why Choose PhoneBid?</h2>
            <p className="text-lg text-gray-400">Complete privacy, secure transactions, and fair pricing</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-8 rounded-2xl hover:border-[#c4ff0d] transition-all duration-300 group transform hover:scale-105 hover:shadow-2xl hover:shadow-[#c4ff0d]/20">
              <div className="w-16 h-16 bg-[#c4ff0d] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Complete Anonymity</h3>
              <p className="text-gray-400 leading-relaxed">
                Your identity is protected with anonymous IDs. Buyers and sellers never see each other's real information.
              </p>
            </div>
            
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-8 rounded-2xl hover:border-[#c4ff0d] transition-all duration-300 group transform hover:scale-105 hover:shadow-2xl hover:shadow-[#c4ff0d]/20">
              <div className="w-16 h-16 bg-[#c4ff0d] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Secure Escrow</h3>
              <p className="text-gray-400 leading-relaxed">
                Funds are held in escrow until both parties complete the transaction. Full protection for buyers and sellers.
              </p>
            </div>
            
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-8 rounded-2xl hover:border-[#c4ff0d] transition-all duration-300 group transform hover:scale-105 hover:shadow-2xl hover:shadow-[#c4ff0d]/20">
              <div className="w-16 h-16 bg-[#c4ff0d] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Fair Auctions</h3>
              <p className="text-gray-400 leading-relaxed">
                Transparent bidding process with real-time updates. No manipulation, just fair market pricing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-[#0a0a0a] relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] via-[#0a0a0a] to-[#0a0a0a]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="text-[#c4ff0d] text-sm font-bold mb-4 tracking-wider uppercase">Getting Started</div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-lg text-gray-400">Simple, secure, and anonymous</p>
          </div>
          
          {/* Steps Container with connecting lines */}
          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#c4ff0d] to-transparent opacity-30" style={{ top: '80px' }}></div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {/* Step 1 */}
              <div className="text-center group">
                <div className="relative inline-block mb-6">
                  {/* Box Container */}
                  <div className="w-32 h-32 bg-[#0f0f0f] border-2 border-[#c4ff0d] rounded-3xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-[#c4ff0d]/30 transition-all duration-300 relative">
                    <svg className="w-12 h-12 text-[#c4ff0d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    {/* Number Badge */}
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#c4ff0d] rounded-full flex items-center justify-center shadow-lg shadow-[#c4ff0d]/50">
                      <span className="text-black text-lg font-bold">1</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Sign Up</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                  Create your account with email verification. Get your anonymous ID instantly.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 bg-[#0f0f0f] border-2 border-[#c4ff0d] rounded-3xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-[#c4ff0d]/30 transition-all duration-300 relative">
                    <svg className="w-12 h-12 text-[#c4ff0d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#c4ff0d] rounded-full flex items-center justify-center shadow-lg shadow-[#c4ff0d]/50">
                      <span className="text-black text-lg font-bold">2</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">List or Browse</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                  List your phone for auction or browse available phones to bid on.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 bg-[#0f0f0f] border-2 border-[#c4ff0d] rounded-3xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-[#c4ff0d]/30 transition-all duration-300 relative">
                    <svg className="w-12 h-12 text-[#c4ff0d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#c4ff0d] rounded-full flex items-center justify-center shadow-lg shadow-[#c4ff0d]/50">
                      <span className="text-black text-lg font-bold">3</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Bid & Win</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                  Place bids anonymously. Highest bidder wins when the auction ends.
                </p>
              </div>

              {/* Step 4 */}
              <div className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 bg-[#0f0f0f] border-2 border-[#c4ff0d] rounded-3xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-[#c4ff0d]/30 transition-all duration-300 relative">
                    <svg className="w-12 h-12 text-[#c4ff0d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#c4ff0d] rounded-full flex items-center justify-center shadow-lg shadow-[#c4ff0d]/50">
                      <span className="text-black text-lg font-bold">4</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Secure Exchange</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                  Meet safely, complete the exchange, and funds are released from escrow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Phones */}
      <section id="marketplace" className="py-20 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-[#c4ff0d] text-sm font-semibold mb-4 tracking-wider uppercase">Live Auctions</div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Featured Phones</h2>
            <p className="text-lg text-gray-400">Latest phones available for bidding</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPhones.map((phone) => (
              <div key={phone._id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden hover:border-[#c4ff0d] transition-all duration-300 group cursor-pointer transform hover:scale-105">
                {/* Image Section */}
                <div className="relative h-56 bg-[#0f0f0f] overflow-hidden">
                  {phone.images?.[0] ? (
                    <img src={phone.images[0]} alt={phone.model} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-20 h-20 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Timer Badge - Top Left */}
                  <div className="absolute top-3 left-3">
                    <div className="bg-black bg-opacity-70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span>2h 45m</span>
                    </div>
                  </div>

                  {/* Condition Badge - Top Right */}
                  <div className="absolute top-3 right-3">
                    {phone.condition === 'Excellent' ? (
                      <span className="bg-[#00d4aa] text-white text-xs font-bold px-3 py-1 rounded-full">
                        Excellent
                      </span>
                    ) : phone.condition === 'Good' ? (
                      <span className="bg-[#c4ff0d] text-black text-xs font-bold px-3 py-1 rounded-full">
                        Good
                      </span>
                    ) : (
                      <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                        Fair
                      </span>
                    )}
                  </div>

                  {/* Bid Now Button - Appears on Hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/phone/${phone._id}`);
                      }}
                      className="w-full bg-[#c4ff0d] text-black py-2 px-4 rounded-lg font-semibold hover:bg-[#d4ff3d] transition flex items-center justify-center gap-2 shadow-lg"
                    >
                      Bid Now
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5">
                  {/* Brand and Model */}
                  <div className="mb-3">
                    <p className="text-gray-400 text-xs mb-1">{phone.brand}</p>
                    <h3 className="text-lg font-bold text-white">{phone.model}</h3>
                    <p className="text-gray-500 text-sm">{phone.storage}</p>
                  </div>

                  {/* Current Bid Section */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-1">Current Bid</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#c4ff0d]">₹{phone.minBidPrice?.toLocaleString()}</span>
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span>12 bids</span>
                      </div>
                    </div>
                  </div>

                  {/* Seller Info */}
                  <div className="pt-3 border-t border-[#2a2a2a]">
                    <div className="text-xs text-gray-500 mb-1">by</div>
                    <span className="text-xs text-gray-400 font-mono">{phone.anonymousSellerId?.substring(0, 15)}...</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/marketplace')}
              className="bg-[#c4ff0d] text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#d4ff3d] transition transform hover:scale-105"
            >
              View All Phones
            </button>
          </div>
        </div>
      </section>

      {/* Reels Section */}
      <section id="reels" className="py-20 bg-[#0a0a0a] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-[#c4ff0d] text-sm font-semibold mb-4 tracking-wider uppercase">Short Videos</div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Phone Reels</h2>
            <p className="text-lg text-gray-400">Watch short videos showcasing phones (max 30 sec)</p>
          </div>

          {/* Reels Grid with Upload Button in Center */}
          <div className="relative">
            {reelsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#c4ff0d] animate-spin" />
              </div>
            ) : reels.length === 0 ? (
              <div className="text-center py-12">
                <Play className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">No reels yet</p>
                <p className="text-gray-500 text-sm mb-6">Be the first to upload a reel!</p>
                <button
                  onClick={handleUploadClick}
                  className="bg-[#c4ff0d] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#d4ff3d] transition flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Upload Reel
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
                {/* First 3 reels */}
                {reels.slice(0, 3).map((reel) => (
                  <ReelCard key={reel._id} reel={reel} onClick={() => navigate('/reels')} />
                ))}
                
                {/* Center Upload Button */}
                <div 
                  onClick={handleUploadClick}
                  className="aspect-[9/16] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-2 border-dashed border-[#c4ff0d] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#1a1a1a] hover:border-solid transition-all group"
                >
                  <div className="w-16 h-16 bg-[#c4ff0d] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-[#c4ff0d]/30">
                    <Plus className="w-8 h-8 text-black" />
                  </div>
                  <p className="text-white font-semibold text-sm">Upload Reel</p>
                  <p className="text-gray-500 text-xs mt-1">Max 30 sec</p>
                </div>
                
                {/* Last 3 reels */}
                {reels.slice(3, 6).map((reel) => (
                  <ReelCard key={reel._id} reel={reel} onClick={() => navigate('/reels')} />
                ))}
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/reels')}
              className="bg-[#c4ff0d] text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#d4ff3d] transition transform hover:scale-105 flex items-center gap-2 mx-auto"
            >
              <Play className="w-5 h-5" />
              View All Reels
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section with 3D Card */}
      <section className="py-20 bg-[#0a0a0a] relative overflow-hidden">
        {/* Background gradient glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#c4ff0d]/10 via-transparent to-transparent"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* 3D Floating Card */}
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#c4ff0d] to-[#a8e000] opacity-30 blur-3xl rounded-3xl"></div>
            
            {/* Main CTA Card */}
            <div className="relative bg-gradient-to-br from-[#2a2a2a] via-[#1f1f1f] to-[#1a1a1a] border border-[#3a3a3a] rounded-3xl p-12 text-center transform transition-all duration-500 hover:scale-105 hover:border-[#c4ff0d]/50 shadow-2xl">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to Start?</h2>
              <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
                Join thousands of users buying and selling phones anonymously
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/auth/signup')}
                  className="bg-[#c4ff0d] text-black px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#d4ff3d] transition transform hover:scale-105 shadow-lg shadow-[#c4ff0d]/30 flex items-center justify-center gap-2"
                >
                  Sign Up Free
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                <button
                  onClick={() => navigate('/marketplace')}
                  className="bg-transparent border-2 border-[#c4ff0d] text-[#c4ff0d] px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#c4ff0d] hover:text-black transition"
                >
                  Browse Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

// Reel Card Component
const ReelCard = ({ reel, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isHovered) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered]);

  return (
    <div 
      className="aspect-[9/16] bg-[#1a1a1a] rounded-2xl overflow-hidden relative cursor-pointer group"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video/Thumbnail */}
      {isHovered ? (
        <video
          ref={videoRef}
          src={reel.videoUrl}
          className="w-full h-full object-cover"
          muted
          loop
          playsInline
        />
      ) : (
        <img 
          src={reel.thumbnailUrl} 
          alt="Reel thumbnail"
          className="w-full h-full object-cover"
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Play Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Play className="w-6 h-6 text-white" fill="white" />
          </div>
        </div>
      </div>

      {/* Stats at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{reel.views || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            <span>{reel.likes?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* User Avatar */}
      <div className="absolute top-3 left-3">
        <div className="w-8 h-8 bg-[#c4ff0d] rounded-full flex items-center justify-center text-black font-bold text-xs">
          {reel.userId?.name?.charAt(0) || 'U'}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalHome;
