import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { phoneAPI } from '../services/api';
import Footer from '../components/common/Footer';
import toast from 'react-hot-toast';

const CreatePhoneListing = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    storage: '',
    ram: '',
    color: '',
    imei: '',
    condition: 'Excellent',
    description: '',
    minBidPrice: '',
    auctionDuration: '7',
    location: '',
    state: '',
    city: '',
    accessories: {
      charger: false,
      bill: false,
      box: false
    }
  });

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Chandigarh', 'Puducherry'
  ];
  const [images, setImages] = useState(['', '', '', '', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Popular phone brands and their models
  const phoneData = {
    'Apple': ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13', 'iPhone 12', 'iPhone 11', 'iPhone SE'],
    'Samsung': ['Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S23 Ultra', 'Galaxy S23', 'Galaxy Z Fold 5', 'Galaxy Z Flip 5', 'Galaxy A54', 'Galaxy A34', 'Galaxy M34'],
    'OnePlus': ['OnePlus 12', 'OnePlus 11', 'OnePlus Nord 3', 'OnePlus Nord CE 3', 'OnePlus 10 Pro', 'OnePlus 9 Pro'],
    'Xiaomi': ['Xiaomi 14', 'Xiaomi 13 Pro', 'Redmi Note 13 Pro', 'Redmi Note 12 Pro', 'Poco X6 Pro', 'Poco F5'],
    'Vivo': ['Vivo V29 Pro', 'Vivo V27 Pro', 'Vivo X90 Pro', 'Vivo Y100', 'Vivo T2 Pro'],
    'Oppo': ['Oppo Reno 11 Pro', 'Oppo Reno 10 Pro', 'Oppo F25 Pro', 'Oppo A79', 'Oppo Find X6 Pro'],
    'Realme': ['Realme 12 Pro+', 'Realme 11 Pro', 'Realme GT 3', 'Realme Narzo 60 Pro', 'Realme C55'],
    'Google': ['Pixel 8 Pro', 'Pixel 8', 'Pixel 7a', 'Pixel 7 Pro', 'Pixel 7'],
    'Motorola': ['Moto Edge 40', 'Moto G84', 'Moto G73', 'Moto G54', 'Moto E13'],
    'Nothing': ['Nothing Phone 2', 'Nothing Phone 1']
  };

  const [availableModels, setAvailableModels] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'brand') {
      setAvailableModels(phoneData[value] || []);
      setFormData({
        ...formData,
        brand: value,
        model: ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleAccessoryChange = (accessory) => {
    setFormData({
      ...formData,
      accessories: {
        ...formData.accessories,
        [accessory]: !formData.accessories[accessory]
      }
    });
  };

  const compressImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onloadend = () => resolve(reader.result);
            },
            'image/jpeg',
            quality
          );
        };
      };
      reader.onerror = reject;
    });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    const currentImageCount = images.filter(img => img).length;
    const availableSlots = 6 - currentImageCount;
    
    if (files.length > availableSlots) {
      setError(`You can only upload ${availableSlots} more image(s). Maximum 6 images allowed.`);
      return;
    }
    
    setError('Compressing images...');
    
    const base64Images = await Promise.all(
      files.map(async (file) => {
        try {
          if (file.size > 3 * 1024 * 1024) {
            throw new Error(`${file.name} is too large. Maximum 3MB per image.`);
          }
          
          const compressed = await compressImage(file, 800, 0.7);
          return compressed;
        } catch (error) {
          throw error;
        }
      })
    ).catch(err => {
      setError(err.message);
      return [];
    });
    
    if (base64Images.length === 0) return;
    
    const newImages = [...images];
    let insertIndex = 0;
    
    for (const base64 of base64Images) {
      while (insertIndex < 6 && newImages[insertIndex]) {
        insertIndex++;
      }
      if (insertIndex < 6) {
        newImages[insertIndex] = base64;
      }
    }
    
    setImages(newImages);
    setError('');
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages[index] = '';
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate images - MINIMUM 2 REQUIRED
    const validImages = images.filter(img => img.trim() !== '');
    if (validImages.length < 2) {
      setError('Please upload at least 2 images of your phone');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const auctionEndTime = new Date();
      auctionEndTime.setDate(auctionEndTime.getDate() + parseInt(formData.auctionDuration));
      
      const phoneData = {
        ...formData,
        images: validImages,
        minBidPrice: parseFloat(formData.minBidPrice),
        auctionStartTime: new Date().toISOString(),
        auctionEndTime: auctionEndTime.toISOString()
      };
      
      await phoneAPI.createPhone(phoneData);
      toast.success('Phone listing created successfully! Awaiting admin verification.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating listing:', error);
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message ||
                          error.message ||
                          'Failed to create listing';
      const errorDetails = error.response?.data?.error?.details;
      setError(errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const uploadedCount = images.filter(img => img).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-4 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#c4ff0d] rounded-xl flex items-center justify-center">
              <span className="text-black font-bold text-lg lg:text-xl">P</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Create Listing</h1>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-2 text-[#c4ff0d]">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Uploads & Ingestion</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Column 1: Device Details */}
            <div className="bg-[#0f0f0f] border-2 border-[#c4ff0d] rounded-xl lg:rounded-2xl p-4 lg:p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl font-bold text-white">1.</span>
                <h2 className="text-xl font-bold text-white">Device Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Brand</label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white px-4 py-3 rounded-lg focus:border-[#c4ff0d] focus:outline-none"
                    required
                  >
                    <option value="">Select Brand</option>
                    {Object.keys(phoneData).map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Model</label>
                  <select
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white px-4 py-3 rounded-lg focus:border-[#c4ff0d] focus:outline-none"
                    required
                    disabled={!formData.brand}
                  >
                    <option value="">Select Model</option>
                    {availableModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Storage</label>
                  <select
                    name="storage"
                    value={formData.storage}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white px-4 py-3 rounded-lg focus:border-[#c4ff0d] focus:outline-none"
                    required
                  >
                    <option value="">Select Storage</option>
                    <option value="64GB">64GB</option>
                    <option value="128GB">128GB</option>
                    <option value="256GB">256GB</option>
                    <option value="512GB">512GB</option>
                    <option value="1TB">1TB</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">RAM</label>
                  <select
                    name="ram"
                    value={formData.ram}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white px-4 py-3 rounded-lg focus:border-[#c4ff0d] focus:outline-none"
                  >
                    <option value="">Select RAM</option>
                    <option value="4GB">4GB</option>
                    <option value="6GB">6GB</option>
                    <option value="8GB">8GB</option>
                    <option value="12GB">12GB</option>
                    <option value="16GB">16GB</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    placeholder="e.g., Space Gray"
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white px-4 py-3 rounded-lg focus:border-[#c4ff0d] focus:outline-none placeholder-gray-600"
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">IMEI Number</label>
                  <input
                    type="text"
                    name="imei"
                    value={formData.imei}
                    onChange={handleChange}
                    placeholder="15-digit IMEI"
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white px-4 py-3 rounded-lg focus:border-[#c4ff0d] focus:outline-none placeholder-gray-600"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 text-gray-500 text-xs pt-2">
                  <svg className="w-4 h-4 text-[#c4ff0d]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>(Encrypted, Only visible to admins)</span>
                </div>
              </div>
            </div>

            {/* Column 2: Condition & Auction */}
            <div className="bg-[#0f0f0f] border-2 border-[#c4ff0d] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl font-bold text-white">2.</span>
                <h2 className="text-xl font-bold text-white">Condition & Auction</h2>
              </div>

              <div className="space-y-6">
                {/* Condition */}
                <div>
                  <label className="text-white font-semibold mb-3 block">Condition</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Excellent', 'Good', 'Fair'].map(cond => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => setFormData({...formData, condition: cond})}
                        className={`py-2 px-4 rounded-lg font-semibold transition ${
                          formData.condition === cond
                            ? 'bg-[#c4ff0d] text-black'
                            : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a]'
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Minimum Bid Price */}
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Minimum Bid Price (₹)</label>
                  <input
                    type="number"
                    name="minBidPrice"
                    value={formData.minBidPrice}
                    onChange={handleChange}
                    placeholder="Enter minimum bid"
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white px-4 py-3 rounded-lg focus:border-[#c4ff0d] focus:outline-none placeholder-gray-600"
                    required
                  />
                </div>

                {/* Device Location - State */}
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">State</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={(e) => {
                      const state = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        state: state,
                        location: prev.city ? `${prev.city}, ${state}` : state
                      }));
                    }}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white px-4 py-3 rounded-lg focus:border-[#c4ff0d] focus:outline-none"
                    required
                  >
                    <option value="">Select State</option>
                    {indianStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                {/* Device Location - City */}
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={(e) => {
                      const city = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        city: city,
                        location: city && prev.state ? `${city}, ${prev.state}` : (prev.state || city)
                      }));
                    }}
                    placeholder="e.g., Ludhiana, Mumbai"
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white px-4 py-3 rounded-lg focus:border-[#c4ff0d] focus:outline-none placeholder-gray-600"
                    required
                  />
                </div>

                {/* Included Accessories */}
                <div>
                  <label className="text-white font-semibold mb-3 block flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#c4ff0d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Included Accessories
                  </label>
                  <div className="space-y-2">
                    {[
                      { key: 'charger', label: 'Charger' },
                      { key: 'bill', label: 'Original Bill' },
                      { key: 'box', label: 'Original Box' }
                    ].map(acc => (
                      <button
                        key={acc.key}
                        type="button"
                        onClick={() => handleAccessoryChange(acc.key)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
                          formData.accessories[acc.key]
                            ? 'bg-[#c4ff0d] bg-opacity-20 border border-[#c4ff0d]'
                            : 'bg-[#1a1a1a] border border-[#2a2a2a]'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          formData.accessories[acc.key]
                            ? 'bg-[#c4ff0d] border-[#c4ff0d]'
                            : 'border-gray-600'
                        }`}>
                          {formData.accessories[acc.key] && (
                            <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-gray-300 text-sm">{acc.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auction Duration */}
                <div>
                  <label className="text-white font-semibold mb-3 block">Auction Duration</label>
                  <select
                    name="auctionDuration"
                    value={formData.auctionDuration}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white px-4 py-3 rounded-lg focus:border-[#c4ff0d] focus:outline-none"
                    required
                  >
                    <option value="1">1 Day</option>
                    <option value="3">3 Days</option>
                    <option value="7">7 Days</option>
                    <option value="14">14 Days</option>
                    <option value="30">30 Days</option>
                  </select>
                  <p className="text-gray-500 text-xs mt-2">Select auction duration</p>
                </div>
              </div>
            </div>

            {/* Column 3: Upload & Describe */}
            <div className="bg-[#0f0f0f] border-2 border-[#c4ff0d] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl font-bold text-white">3.</span>
                <h2 className="text-xl font-bold text-white">Upload & Describe</h2>
              </div>

              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <div className="border-2 border-dashed border-[#2a2a2a] rounded-xl p-8 text-center hover:border-[#c4ff0d] transition">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-gray-400 mb-2">Drag & drop images</p>
                      <p className="text-gray-600 text-xs">Click to upload images. PNG, JPG up 3MB each.</p>
                      <p className="text-[#c4ff0d] text-sm mt-2 font-semibold">
                        Uploaded: {uploadedCount} / 6 maximum
                      </p>
                      {uploadedCount < 2 && (
                        <p className="text-red-400 text-xs mt-2">Minimum 2 images required</p>
                      )}
                    </label>
                  </div>

                  {/* Image Previews */}
                  {uploadedCount > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {images.map((img, index) => img && (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-[#2a2a2a]"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="text-white font-semibold mb-3 block">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Saleintou..."
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white px-4 py-3 rounded-lg focus:border-[#c4ff0d] focus:outline-none placeholder-gray-600 resize-none"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 justify-center">
            <button
              type="submit"
              disabled={submitting || uploadedCount < 2}
              className="bg-[#c4ff0d] text-black px-12 py-4 rounded-lg font-bold text-lg hover:bg-[#d4ff3d] transition disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating Listing...' : 'Create Listing'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="bg-[#1a1a1a] border border-[#2a2a2a] text-white px-12 py-4 rounded-lg font-bold text-lg hover:bg-[#2a2a2a] transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CreatePhoneListing;
