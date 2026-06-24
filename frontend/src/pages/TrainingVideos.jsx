import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import ImageWithFallback from '../components/ImageWithFallback';
import SEO from '../components/SEO';
import { HiLockClosed, HiPlay, HiX, HiClock, HiExclamationCircle } from 'react-icons/hi';

export default function TrainingVideos() {
  const [searchParams] = useSearchParams();
  const redirectItemId = searchParams.get('itemId');

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchasedIds, setPurchasedIds] = useState([]);
  const [error, setError] = useState('');
  const [videoError, setVideoError] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data } = await API.get('/training-videos');
        setVideos(data);
        const userRes = await API.get('/auth/me');
        const ids = userRes.data.purchasedItems?.trainingVideos?.map((v) => v._id || v) || [];
        setPurchasedIds(ids);

        // If redirected from payment callback, auto-open the purchased item
        if (redirectItemId) {
          const purchased = data.find((v) => v._id === redirectItemId);
          if (purchased) {
            handleWatch(purchased);
          }
        }
      } catch (err) {
        console.error('Error fetching videos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [redirectItemId]);

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
    <>
      <SEO
        title="Training Videos"
        description="Stream expert baking tutorials and masterclasses from Mwiti Bakers. Learn professional baking techniques at your own pace."
        url="https://mwitibakers.com/training-videos"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="text-center mb-8 sm:mb-10">
        <img
          src="/New.jpg"
          alt="Mwiti Bakers - Premium Baking Content Logo"
          className="h-14 sm:h-16 w-auto mx-auto mb-4 object-contain"
          loading="lazy"
          decoding="async"
        />
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-navy">Training Videos</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-2xl mx-auto">
          Stream expert baking tutorials. Learn from the best bakers.
        </p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
                  className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                    !purchasedIds.includes(video._id) ? 'blur-lg opacity-60' : 'opacity-90'
                  }`}
                />
                {!purchasedIds.includes(video._id) ? (
                  <div className="absolute inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center">
                    <div className="bg-white/90 rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform">
                      <HiLockClosed className="text-xl sm:text-2xl text-brand-navy" />
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <div className="bg-brand-gold rounded-full p-4 shadow-lg">
                      <HiPlay className="text-2xl sm:text-3xl text-white" />
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
              <div className="p-3 sm:p-4">
                <h3 className="font-semibold text-brand-navy text-sm sm:text-base truncate">{video.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">{video.description || 'No description'}</p>
                <div className="mt-3 flex gap-2">
                  {purchasedIds.includes(video._id) ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleWatch(video); }}
                      className="w-full text-xs sm:text-sm bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <HiPlay className="text-sm" />
                      <span>Watch Now</span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePurchase(video); }}
                      disabled={purchasing}
                      className="w-full text-xs sm:text-sm bg-brand-gold text-white py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      <HiLockClosed className="text-sm" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80" onClick={() => setSelectedVideo(null)}>
          <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-2 sm:m-4" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-black/60 text-white rounded-full p-1.5 sm:p-2 hover:bg-black/80 transition-colors"
              >
                <HiX className="text-lg sm:text-xl" />
              </button>

              {selectedVideo.isLocked ? (
                <div className="relative aspect-video bg-gray-800 flex items-center justify-center">
                  <ImageWithFallback
                    src={selectedVideo.thumbnailUrl}
                    alt={selectedVideo.title}
                    type="video"
                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-50"
                  />
                  <div className="relative z-10 text-center px-4">
                    <HiLockClosed className="text-4xl sm:text-6xl text-brand-gold mb-4 mx-auto" />
                    <p className="text-white text-lg sm:text-xl font-semibold mb-2">This video is locked</p>
                    <p className="text-gray-400 mb-6 text-sm sm:text-base">Purchase to stream this training video</p>
                    <button
                      onClick={() => handlePurchase(selectedVideo)}
                      disabled={purchasing}
                      className="btn-gold disabled:opacity-50"
                    >
                      {purchasing ? 'Processing...' : `Unlock for KES ${selectedVideo.price}`}
                    </button>
                  </div>
                </div>
              ) : videoError ? (
                <div className="aspect-video bg-gray-800 flex items-center justify-center">
                  <div className="text-center px-4">
                    <HiExclamationCircle className="text-4xl sm:text-5xl text-red-400 mb-4 mx-auto" />
                    <p className="text-white text-lg font-semibold mb-2">Video Playback Error</p>
                    <p className="text-gray-400 text-sm mb-4 max-w-md">
                      This video could not be streamed. The link may be from a provider that doesn't allow direct embedding (e.g. Google Drive, Dropbox).
                    </p>
                    <p className="text-gray-400 text-xs mb-4">
                      Try opening the video directly instead:
                    </p>
                    <a
                      href={selectedVideo.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-gold text-sm inline-flex items-center space-x-2"
                    >
                      <HiPlay className="text-lg" />
                      <span>Open Video in New Tab</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-black">
                  <video
                    ref={videoRef}
                    className="w-full h-full"
                    controls
                    autoPlay
                    onError={() => setVideoError('This video format is not supported or the URL is invalid.')}
                  >
                    <source src={selectedVideo.videoUrl} type="video/mp4" />
                    <source src={selectedVideo.videoUrl} type="video/webm" />
                    <source src={selectedVideo.videoUrl} type="video/ogg" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 bg-white">
              <h2 className="text-xl sm:text-2xl font-bold text-brand-navy">{selectedVideo.title}</h2>
              <div className="flex items-center space-x-4 mt-2 text-xs sm:text-sm text-gray-500">
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
              <p className="text-sm sm:text-base text-gray-600 mt-4">{selectedVideo.description}</p>
              {!selectedVideo.isLocked && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg text-xs sm:text-sm text-amber-700">
                  <strong>Note:</strong> This video is available for streaming only. Downloads are not permitted.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
