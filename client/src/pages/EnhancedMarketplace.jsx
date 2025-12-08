import { useState, useEffect, useCallback, useRef } from 'react';
import { phoneAPI, auctionAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/common/Footer';

const EnhancedMarketplace = () => {
  const [phones, setPhones] = useState([]);
  const [auctions, setAuctions] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    storage: '',
    ram: '',
    color: '',
    condition: '',
    minPrice: 0,
    maxPrice: 100000,
    location: '',
    trendingDeals: false,
    anonymousUsers: false
  });

  const [showConditionDropdown, setShowConditionDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showTechnicalDropdown, setShowTechnicalDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  const isInitialMount = useRef(true);

  const brands = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Vivo', 'Oppo', 'Realme', 'Google', 'Motorola', 'Nothing'];
  const conditions = ['Excellent', 'Good', 'Fair', 'Poor'];
  const storageOptions = ['64GB', '128GB', '256GB', '512GB', '1TB'];
  const ramOptions = ['4GB', '6GB', '8GB', '12GB', '16GB'];
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Chandigarh', 'Puducherry'
  ];
  const [selectedState, setSelectedState] = useState('');
  const [cityInput, setCityInput] = useState('');
  const navigate = useNavigate();

  // Load phones only on initial mount
  useEffect(() => {
    loadPhones();
  }, []);

  const loadPhones = async () => {
    try {
      setLoading(true);
      
      // Build params with separate state and city for better filtering
      const params = {
        status: 'live',
        brand: filters.brand,
        condition: filters.condition,
        storage: filters.storage,
        ram: filters.ram,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice
      };
      
      // Add location filters - send state and city separately
      if (selectedState) {
        params.state = selectedState;
      }
      if (cityInput) {
        params.city = cityInput;
      }
      // Also send combined location for backward compatibility
      if (filters.location) {
        params.location = filters.location;
      }
      
      const res = await phoneAPI.getAllPhones(params);
      const allPhones = res.data.data;
      setPhones(allPhones);
      
      // Load auctions for each phone
      const auctionPromises = allPhones.map(phone => 
        auctionAPI.getAuctionByPhoneId(phone._id).catch(() => null)
      );
      const auctionResults = await Promise.all(auctionPromises);
      
      const auctionMap = {};
      auctionResults.forEach((result, index) => {
        if (result?.data?.data) {
          auctionMap[allPhones[index]._id] = result.data.data;
        }
      });
      setAuctions(auctionMap);
    } catch (error) {
      console.error('Error loading phones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      brand: '',
      model: '',
      storage: '',
      ram: '',
      color: '',
      condition: '',
      minPrice: 0,
      maxPrice: 100000,
      location: '',
      trendingDeals: false,
      anonymousUsers: false
    });
    setShowConditionDropdown(false);
    setShowBrandDropdown(false);
    setShowTechnicalDropdown(false);
    setShowLocationDropdown(false);
    setSelectedState('');
    setCityInput('');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.brand) count++;
    if (filters.model) count++;
    if (filters.storage) count++;
    if (filters.ram) count++;
    if (filters.color) count++;
    if (filters.condition) count++;
    if (selectedState) count++; // Count state selection instead of location string
    if (filters.trendingDeals) count++;
    if (filters.anonymousUsers) count++;
    return count;
  };

  const getTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c4ff0d] mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4">
          <button onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="w-full flex items-center justify-between bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-4">
            <span className="text-white font-semibold">Filters</span>
            <span className="text-[#c4ff0d]">{getActiveFilterCount() > 0 ? `(${getActiveFilterCount()})` : ''}</span>
          </button>
        </div>

        {/* Mobile Filters Overlay */}
        {mobileFiltersOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/80" onClick={() => setMobileFiltersOpen(false)}>
            <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-[#0f0f0f] p-4 overflow-y-auto scrollbar-thin scrollbar-track-[#1a1a1a] scrollbar-thumb-[#c4ff0d] scrollbar-thumb-rounded-full" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-lg">Filters</h2>
                <button onClick={() => setMobileFiltersOpen(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
              </div>
              <button onClick={clearAllFilters} className="text-[#c4ff0d] text-sm mb-4">Clear All</button>
              {/* Mobile filter content - simplified */}
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm mb-2 block">Brand</label>
                  <select value={filters.brand} onChange={(e) => handleFilterChange('brand', e.target.value)}
                    className="w-full p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white">
                    <option value="">All Brands</option>
                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white text-sm mb-2 block">Condition</label>
                  <select value={filters.condition} onChange={(e) => handleFilterChange('condition', e.target.value)}
                    className="w-full p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white">
                    <option value="">All Conditions</option>
                    {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white text-sm mb-2 block">Storage</label>
                  <select value={filters.storage} onChange={(e) => handleFilterChange('storage', e.target.value)}
                    className="w-full p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white">
                    <option value="">All Storage</option>
                    {storageOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <button onClick={() => { loadPhones(); setMobileFiltersOpen(false); }}
                  className="w-full bg-[#c4ff0d] text-black py-3 rounded-lg font-bold">Apply Filters</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Desktop Filters Sidebar */}
          {showFilters && (
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-6 sticky top-24">
                {/* Active Filters Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white font-bold text-lg">Active Filters</h2>
                  <button
                    onClick={clearAllFilters}
                    className="text-[#c4ff0d] text-sm hover:text-[#d4ff3d] transition"
                  >
                    Clear All
                  </button>
                </div>

                {/* Filter Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {filters.trendingDeals && (
                    <span className="bg-[#c4ff0d] text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      Trending Deals
                      <button onClick={() => handleFilterChange('trendingDeals', false)} className="hover:text-gray-700">×</button>
                    </span>
                  )}
                  {filters.anonymousUsers && (
                    <span className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                      Anonymous Users
                      <button onClick={() => handleFilterChange('anonymousUsers', false)} className="text-gray-500 hover:text-white">×</button>
                    </span>
                  )}
                  {filters.brand && (
                    <span className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                      {filters.brand}
                      <button onClick={() => handleFilterChange('brand', '')} className="text-gray-500 hover:text-white">×</button>
                    </span>
                  )}
                  {filters.condition && (
                    <span className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                      {filters.condition}
                      <button onClick={() => handleFilterChange('condition', '')} className="text-gray-500 hover:text-white">×</button>
                    </span>
                  )}
                  {filters.storage && (
                    <span className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                      {filters.storage}
                      <button onClick={() => handleFilterChange('storage', '')} className="text-gray-500 hover:text-white">×</button>
                    </span>
                  )}
                  {selectedState && (
                    <span className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                      📍 {cityInput ? `${cityInput}, ${selectedState}` : selectedState}
                      <button onClick={() => { handleFilterChange('location', ''); setSelectedState(''); setCityInput(''); }} className="text-gray-500 hover:text-white">×</button>
                    </span>
                  )}
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="text-white font-semibold mb-3 block">Price Range</label>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Min Price</span>
                        <span>₹{filters.minPrice.toLocaleString()}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100000"
                        step="5000"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value))}
                        className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#c4ff0d]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Max Price</span>
                        <span>₹{filters.maxPrice.toLocaleString()}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100000"
                        step="5000"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                        className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#c4ff0d]"
                      />
                    </div>
                  </div>
                </div>

                {/* Condition */}
                <div className="mb-6">
                  <label className="text-white font-semibold mb-3 block">Condition</label>
                  <div className="relative">
                    <button
                      onClick={() => setShowConditionDropdown(!showConditionDropdown)}
                      className="w-full flex items-center justify-between bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 hover:border-[#c4ff0d] transition"
                    >
                      <span className="text-gray-300 text-sm">{filters.condition || 'Select Condition'}</span>
                      <div className={`w-12 h-6 rounded-full relative transition ${filters.condition ? 'bg-[#c4ff0d]' : 'bg-[#2a2a2a]'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${filters.condition ? 'right-1 bg-black' : 'left-1 bg-gray-600'}`}></div>
                      </div>
                    </button>
                    {showConditionDropdown && (
                      <div className="absolute z-10 w-full mt-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
                        {conditions.map(condition => (
                          <button
                            key={condition}
                            onClick={() => {
                              handleFilterChange('condition', condition);
                              setShowConditionDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 text-gray-300 hover:bg-[#2a2a2a] hover:text-[#c4ff0d] transition text-sm"
                          >
                            {condition}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Brand */}
                <div className="mb-6">
                  <label className="text-white font-semibold mb-3 block">Brand</label>
                  <div className="relative">
                    <button
                      onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                      className="w-full flex items-center justify-between bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 hover:border-[#c4ff0d] transition"
                    >
                      <span className="text-gray-300 text-sm">{filters.brand || 'Select Brand'}</span>
                      <div className={`w-12 h-6 rounded-full relative transition ${filters.brand ? 'bg-[#c4ff0d]' : 'bg-[#2a2a2a]'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${filters.brand ? 'right-1 bg-black' : 'left-1 bg-gray-600'}`}></div>
                      </div>
                    </button>
                    {showBrandDropdown && (
                      <div className="absolute z-10 w-full mt-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg max-h-60 overflow-y-auto scrollbar-thin scrollbar-track-[#1a1a1a] scrollbar-thumb-[#c4ff0d] scrollbar-thumb-rounded-full">
                        {brands.map(brand => (
                          <button
                            key={brand}
                            onClick={() => {
                              handleFilterChange('brand', brand);
                              setShowBrandDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 text-gray-300 hover:bg-[#2a2a2a] hover:text-[#c4ff0d] transition text-sm"
                          >
                            {brand}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Technical Specs */}
                <div className="mb-6">
                  <label className="text-white font-semibold mb-3 block">Technical Specs</label>
                  <div className="relative">
                    <button
                      onClick={() => setShowTechnicalDropdown(!showTechnicalDropdown)}
                      className="w-full flex items-center justify-between bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 hover:border-[#c4ff0d] transition"
                    >
                      <span className="text-gray-300 text-sm">
                        {filters.storage || filters.ram ? `${filters.storage || ''} ${filters.ram || ''}`.trim() : 'Select Specs'}
                      </span>
                      <div className={`w-12 h-6 rounded-full relative transition ${(filters.storage || filters.ram) ? 'bg-[#c4ff0d]' : 'bg-[#2a2a2a]'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${(filters.storage || filters.ram) ? 'right-1 bg-black' : 'left-1 bg-gray-600'}`}></div>
                      </div>
                    </button>
                    {showTechnicalDropdown && (
                      <div className="absolute z-10 w-full mt-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
                        <div className="mb-3">
                          <label className="text-gray-400 text-xs mb-2 block">Storage</label>
                          <div className="grid grid-cols-2 gap-2">
                            {storageOptions.map(storage => (
                              <button
                                key={storage}
                                onClick={() => handleFilterChange('storage', filters.storage === storage ? '' : storage)}
                                className={`px-3 py-1 rounded-lg text-xs transition ${
                                  filters.storage === storage
                                    ? 'bg-[#c4ff0d] text-black font-bold'
                                    : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
                                }`}
                              >
                                {storage}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-gray-400 text-xs mb-2 block">RAM</label>
                          <div className="grid grid-cols-2 gap-2">
                            {ramOptions.map(ram => (
                              <button
                                key={ram}
                                onClick={() => handleFilterChange('ram', filters.ram === ram ? '' : ram)}
                                className={`px-3 py-1 rounded-lg text-xs transition ${
                                  filters.ram === ram
                                    ? 'bg-[#c4ff0d] text-black font-bold'
                                    : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
                                }`}
                              >
                                {ram}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="mb-6">
                  <label className="text-white font-semibold mb-3 block">Location</label>
                  <div className="space-y-3">
                    {/* State Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                        className="w-full flex items-center justify-between bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 hover:border-[#c4ff0d] transition"
                      >
                        <span className="text-gray-300 text-sm">{selectedState || 'Select State'}</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {showLocationDropdown && (
                        <div className="absolute z-10 w-full mt-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg max-h-60 overflow-y-auto scrollbar-thin scrollbar-track-[#1a1a1a] scrollbar-thumb-[#c4ff0d] scrollbar-thumb-rounded-full">
                          {indianStates.map(state => (
                            <button
                              key={state}
                              onClick={() => {
                                setSelectedState(state);
                                // Update location filter with state (city will be added if entered)
                                handleFilterChange('location', cityInput ? `${cityInput}, ${state}` : state);
                                setShowLocationDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2 text-gray-300 hover:bg-[#2a2a2a] hover:text-[#c4ff0d] transition text-sm"
                            >
                              {state}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* City Input - Shows after state is selected */}
                    {selectedState && (
                      <div>
                        <input
                          type="text"
                          value={cityInput}
                          onChange={(e) => {
                            setCityInput(e.target.value);
                            handleFilterChange('location', e.target.value ? `${e.target.value}, ${selectedState}` : selectedState);
                          }}
                          placeholder="Enter city name (optional)"
                          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#c4ff0d]"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Anonymity Status */}
                <div className="mb-6">
                  <label className="text-white font-semibold mb-3 block">Anonymity Status</label>
                  <button
                    onClick={() => handleFilterChange('anonymousUsers', !filters.anonymousUsers)}
                    className="w-full flex items-center justify-between bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 hover:border-[#c4ff0d] transition"
                  >
                    <span className="text-gray-300 text-sm">Anonymous Users Only</span>
                    <div className={`w-12 h-6 rounded-full relative transition ${filters.anonymousUsers ? 'bg-[#c4ff0d]' : 'bg-[#2a2a2a]'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${filters.anonymousUsers ? 'right-1 bg-black' : 'left-1 bg-gray-600'}`}></div>
                    </div>
                  </button>
                </div>

                {/* Apply Filters Button */}
                <button
                  onClick={loadPhones}
                  className="w-full bg-[#c4ff0d] text-black py-3 rounded-lg font-bold hover:bg-[#d4ff3d] transition"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Available Phones ({phones.length})
                  </h1>
                  <p className="text-gray-400">Browse and bid on phones</p>
                </div>
              </div>
            </div>

            {/* Phone Grid */}
            {phones.length === 0 ? (
              <div className="text-center py-12 lg:py-20">
                <p className="text-gray-500 text-base lg:text-lg">No phones available at the moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
                {phones.map((phone) => {
                  const auction = auctions[phone._id];
                  return (
                    <div
                      key={phone._id}
                      className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl lg:rounded-2xl overflow-hidden hover:border-[#c4ff0d] transition-all duration-300 group cursor-pointer"
                      onClick={() => navigate(`/phone/${phone._id}`)}
                    >
                      {/* Image */}
                      <div className="relative h-36 sm:h-44 lg:h-56 bg-[#1a1a1a] overflow-hidden">
                        {phone.images && phone.images[0] ? (
                          <img
                            src={phone.images[0]}
                            alt={`${phone.brand} ${phone.model}`}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <svg className="w-20 h-20 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        
                        {/* Condition Badge */}
                        <div className="absolute top-3 right-3">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                            phone.condition === 'Excellent' ? 'bg-[#00d4aa] text-white' :
                            phone.condition === 'Good' ? 'bg-[#c4ff0d] text-black' :
                            'bg-yellow-500 text-black'
                          }`}>
                            {phone.condition}
                          </span>
                        </div>

                        {/* Place Bid Button - Appears on Hover */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/phone/${phone._id}`);
                            }}
                            className="w-full bg-[#c4ff0d] text-black py-2 px-4 rounded-lg font-semibold hover:bg-[#d4ff3d] transition flex items-center justify-center gap-2 shadow-lg"
                          >
                            Place Bid
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="mb-3">
                          <p className="text-gray-400 text-xs mb-1">{phone.brand}</p>
                          <h3 className="text-lg font-bold text-white">{phone.model}</h3>
                          <p className="text-gray-500 text-sm">{phone.storage}</p>
                        </div>

                        {/* Current Bid */}
                        <div className="mb-4">
                          <div className="text-xs text-gray-500 mb-1">Current Bid</div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-[#c4ff0d]">
                              ₹{(auction?.currentBid || phone.minBidPrice)?.toLocaleString()}
                            </span>
                            <div className="flex items-center gap-1 text-gray-400 text-xs">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                              </svg>
                              <span>{auction?.totalBids || 0} bids</span>
                            </div>
                          </div>
                        </div>

                        {/* Seller Info - Clickable */}
                        <div className="pt-3 border-t border-[#2a2a2a]">
                          <div className="text-xs text-gray-500 mb-1">by</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/user/${phone.anonymousSellerId}`);
                            }}
                            className="text-xs text-[#c4ff0d] font-mono hover:underline"
                          >
                            @{phone.anonymousSellerId}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EnhancedMarketplace;
