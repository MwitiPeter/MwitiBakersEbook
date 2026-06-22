import { useState, useEffect } from 'react';
import API from '../api/axios';
import ImageWithFallback from '../components/ImageWithFallback';
import { HiLockClosed, HiDownload, HiEye, HiX } from 'react-icons/hi';

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchasedIds, setPurchasedIds] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data } = await API.get('/images');
        setImages(data);
        // Get user's purchased items
        const userRes = await API.get('/auth/me');
        setPurchasedIds(userRes.data.purchasedItems?.images?.map((i) => i._id || i) || []);
      } catch (err) {
        console.error('Error fetching images:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  const handlePurchase = async (image) => {
    setError('');
    setPurchasing(true);
    try {
      const { data } = await API.post('/payments/initialize', {
        itemType: 'image',
        itemId: image._id,
      });
      // Redirect to Paystack
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      setPurchasing(false);
    }
  };

  const handleViewDetail = async (image) => {
    if (purchasedIds.includes(image._id)) {
      try {
        const { data } = await API.get(`/images/${image._id}/unlock`);
        setSelectedImage(data);
      } catch (err) {
        console.error('Error unlocking image:', err);
      }
    } else {
      setSelectedImage({ ...image, isLocked: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-gold border-t-brand-navy rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <h1 className="section-title">Image Gallery</h1>
        <p className="section-subtitle">Discover premium baking photography. Unlock and download your favorites.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm max-w-md mx-auto">
          {error}
        </div>
      )}

      {images.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-6xl">🖼️</span>
          <p className="text-gray-400 mt-4 text-lg">No images available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((image) => (
            <div
              key={image._id}
              className="card group cursor-pointer"
              onClick={() => handleViewDetail(image)}
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <ImageWithFallback
                  src={image.previewUrl}
                  alt={image.title}
                  type="image"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {!purchasedIds.includes(image._id) && (
                  <div className="absolute inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center">
                    <div className="bg-white/90 rounded-full p-3 shadow-lg">
                      <HiLockClosed className="text-2xl text-brand-navy" />
                    </div>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-brand-navy text-white text-xs font-bold px-2 py-1 rounded-full">
                  KES {image.price}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-brand-navy truncate">{image.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{image.description || 'No description'}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleViewDetail(image); }}
                    className="flex-1 text-sm bg-brand-cream text-brand-navy py-2 rounded-lg font-medium hover:bg-brand-navy hover:text-white transition-colors flex items-center justify-center space-x-1"
                  >
                    <HiEye />
                    <span>View</span>
                  </button>
                  {purchasedIds.includes(image._id) ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleViewDetail(image); }}
                      className="flex-1 text-sm bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
                    >
                      <HiDownload />
                      <span>Download</span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePurchase(image); }}
                      disabled={purchasing}
                      className="flex-1 text-sm bg-brand-gold text-white py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50"
                    >
                      Unlock
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setSelectedImage(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 bg-white/90 rounded-full p-2 hover:bg-white shadow-lg transition-colors"
              >
                <HiX className="text-xl" />
              </button>
              <div className="relative aspect-video bg-gray-100">
                <ImageWithFallback
                  src={selectedImage.isLocked ? selectedImage.previewUrl : selectedImage.fullUrl}
                  alt={selectedImage.title}
                  type="image"
                  className={`w-full h-full object-contain ${selectedImage.isLocked ? 'blur-lg' : ''}`}
                />
                {selectedImage.isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <HiLockClosed className="text-5xl text-white mb-2 mx-auto" />
                      <p className="text-white font-semibold">Unlock to view full image</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-brand-navy">{selectedImage.title}</h2>
              <p className="text-gray-600 mt-2">{selectedImage.description}</p>
              <div className="flex items-center justify-between mt-6">
                <span className="text-2xl font-bold text-brand-gold">KES {selectedImage.price}</span>
                {selectedImage.isLocked ? (
                  <button
                    onClick={() => handlePurchase(selectedImage)}
                    disabled={purchasing}
                    className="btn-gold disabled:opacity-50"
                  >
                    {purchasing ? 'Processing...' : 'Unlock Now'}
                  </button>
                ) : (
                  <a
                    href={selectedImage.fullUrl}
                    download
                    className="btn-primary flex items-center space-x-2"
                  >
                    <HiDownload />
                    <span>Download Image</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
