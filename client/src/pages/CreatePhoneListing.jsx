import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { phoneAPI } from '../services/api';

const CreatePhoneListing = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    storage: '',
    ram: '',
    color: '',
    imei: '',
    condition: 'good',
    description: '',
    minBidPrice: '',
    auctionDuration: '7',
    accessories: {
      charger: false,
      bill: false,
      box: false
    }
  });
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
    
    // If brand changes, update available models
    if (name === 'brand') {
      setAvailableModels(phoneData[value] || []);
      setFormData({
        ...formData,
        brand: value,
        model: '' // Reset model when brand changes
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

          // Calculate new dimensions
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression
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
    
    // Check if adding these files would exceed 6 images
    const currentImageCount = images.filter(img => img).length;
    const availableSlots = 6 - currentImageCount;
    
    if (files.length > availableSlots) {
      setError(`You can only upload ${availableSlots} more image(s). Maximum 6 images allowed.`);
      return;
    }
    
    setError('Compressing images...');
    
    // Convert files to compressed base64
    const base64Images = await Promise.all(
      files.map(async (file) => {
        try {
          // Check file size (10MB limit before compression)
          if (file.size > 10 * 1024 * 1024) {
            throw new Error(`${file.name} is too large. Maximum 10MB per image.`);
          }
          
          // Compress image
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
    
    // Add new images to the array
    const newImages = [...images];
    let insertIndex = 0;
    
    for (const base64 of base64Images) {
      // Find next empty slot
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
    
    // Validate images
    const validImages = images.filter(img => img.trim() !== '');
    if (validImages.length < 1) {
      setError('Please provide at least 1 image');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Calculate auction end time
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
      alert('Phone listing created successfully! Awaiting admin verification.');
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Phone Listing</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand *
                </label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Brand</option>
                  {Object.keys(phoneData).map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model *
                </label>
                <select
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!formData.brand}
                >
                  <option value="">Select Model</option>
                  {availableModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
                {!formData.brand && (
                  <p className="text-xs text-gray-500 mt-1">Select a brand first</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Storage *
                </label>
                <select
                  name="storage"
                  value={formData.storage}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RAM
                </label>
                <input
                  type="text"
                  name="ram"
                  value={formData.ram}
                  onChange={handleChange}
                  placeholder="e.g., 8GB"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="e.g., Space Gray"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IMEI Number * (Encrypted)
                </label>
                <input
                  type="text"
                  name="imei"
                  value={formData.imei}
                  onChange={handleChange}
                  placeholder="15-digit IMEI"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Only visible to admins</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition *
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Bid Price * (₹)
                </label>
                <input
                  type="number"
                  name="minBidPrice"
                  value={formData.minBidPrice}
                  onChange={handleChange}
                  placeholder="5000"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Accessories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Included Accessories
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.accessories.charger}
                    onChange={() => handleAccessoryChange('charger')}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">🔌 Charger</span>
                </label>
                
                <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.accessories.bill}
                    onChange={() => handleAccessoryChange('bill')}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">📄 Bill</span>
                </label>
                
                <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.accessories.box}
                    onChange={() => handleAccessoryChange('box')}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">📦 Box</span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe your phone's condition, features, and any additional details..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images * (Minimum 1 required, up to 6)
              </label>
              
              {/* Image Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm text-gray-600">Click to upload images</span>
                  <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB each</span>
                </label>
              </div>

              {/* Image Previews */}
              {images.filter(img => img).length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {images.map((img, index) => img && (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        Image {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-sm text-gray-600">
                Uploaded: {images.filter(img => img).length} / 6 maximum
              </p>
            </div>

            {/* Auction Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auction Duration *
              </label>
              <select
                name="auctionDuration"
                value={formData.auctionDuration}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="1">1 Day</option>
                <option value="3">3 Days</option>
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
                <option value="30">30 Days</option>
              </select>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating Listing...' : 'Create Listing'}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePhoneListing;
