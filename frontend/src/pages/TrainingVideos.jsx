import { useState, useEffect } from 'react';
import API from '../api/axios';
import ImageWithFallback from '../components/ImageWithFallback';
import { HiLockClosed, HiPlay, HiX, HiClock } from 'react-icons/hi';

export default function TrainingVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchasedIds, setPurchasedIds] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data } = await API.get('/training-videos');
        setVideos(data);
        const userRes = await API.get('/auth/me');
        setPurchasedIds(userRes.data.purchasedItems?.trainingVideos?.map((v) => v._id || v) || []);
      } catch (err) {
        console.error('Error fetching videos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const handlePurchase = async (video) => {
    setError('');
    setPurchasing(true);
    try {
      const { data } = await API.post('/payments/initialize', {
        itemType: 'trainingVideo',
        itemId: video._id,
      });
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      setPurchasing(false);
    }
  };

  const handleWatch = async (video) => {
    if (purchasedIds.includes(video._id)) {
      try {
        const { data } = await API.get(`/training-videos/${video._id}/unlock`);
        setSelectedVideo(data);
      } catch (err) {
        console.error('Error unlocking video:', err);
      }
    } else {
      setSelectedVideo({ ...video, isLocked: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-gold border-t-brand-navy rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading training videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <h1 className="section-title">Training Videos</h1>
        <p className="section-subtitle">Stream expert baking tutorials. Learn from the best bakers.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm max-w-md mx-auto">
          {error}
        </div>
      )}

      {videos.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-6xl">🎬</span>
          <p className="text-gray-400 mt-4 text-lg">No training videos available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <div
              key={video._id}
              className="card group cursor-pointer"
              onClick={() => handleWatch(video)}
            >
              <div className="relative aspect-video overflow-hidden bg-gray-900">
                <ImageWithFallback
                  src={video.thumbnailUrl}
                  alt={video.title}
                  type="video"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                {!purchasedIds.includes(video._id) ? (
                  <div className="absolute inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center">
                    <div className="bg-white/90 rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform">
                      <HiLockClosed className="text-2xl text-brand-navy" />
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <div className="bg-brand-gold rounded-full p-4 shadow-lg">
                      <HiPlay className="text-3xl text-white" />
                    </div>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-brand-navy text-white text-xs font-bold px-2 py-1 rounded-full">
                  KES {video.price}
                </div>
                {video.duration && (
                  <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                    <HiClock className="text-xs" />
                    <span>{video.duration}</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-brand-navy truncate">{video.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{video.description || 'No description'}</p>
                <div className="mt-3 flex gap-2">
                  {purchasedIds.includes(video._id) ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleWatch(video); }}
                      className="w-full text-sm bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <HiPlay />
                      <span>Watch Now</span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePurchase(video); }}
                      disabled={purchasing}
                      className="w-full text-sm bg-brand-gold text-white py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      <HiLockClosed />
                      <span>Unlock</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setSelectedVideo(null)}>
          <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-10 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 transition-colors"
              >
                <HiX className="text-xl" />
              </button>

              {selectedVideo.isLocked ? (
                <div className="relative aspect-video bg-gray-800 flex items-center justify-center">
                  <ImageWithFallback
                    src={selectedVideo.thumbnailUrl}
                    alt={selectedVideo.title}
                    type="video"
                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-50"
                  />
                  <div className="relative z-10 text-center">
                    <HiLockClosed className="text-6xl text-brand-gold mb-4 mx-auto" />
                    <p className="text-white text-xl font-semibold mb-2">This video is locked</p>
                    <p className="text-gray-400 mb-6">Purchase to stream this training video</p>
                    <button
                      onClick={() => handlePurchase(selectedVideo)}
                      disabled={purchasing}
                      className="btn-gold disabled:opacity-50"
                    >
                      {purchasing ? 'Processing...' : `Unlock for KES ${selectedVideo.price}`}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-black">
                  <video
                    className="w-full h-full"
                    controls
                    autoPlay
                    src={selectedVideo.videoUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>

            <div className="p-6 bg-white">
              <h2 className="text-2xl font-bold text-brand-navy">{selectedVideo.title}</h2>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                {selectedVideo.duration && (
                  <span className="flex items-center space-x-1">
                    <HiClock />
                    <span>{selectedVideo.duration}</span>
                  </span>
                )}
                {selectedVideo.viewCount > 0 && (
                  <span>{selectedVideo.viewCount} views</span>
                )}
              </div>
              <p className="text-gray-600 mt-4">{selectedVideo.description}</p>
              {!selectedVideo.isLocked && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg text-sm text-amber-700">
                  <strong>Note:</strong> This video is available for streaming only. Downloads are not permitted.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
