import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiPhotograph, HiBookOpen, HiPlay, HiArrowRight } from 'react-icons/hi';
import { useState, useEffect } from 'react';
import API from '../api/axios';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ images: 0, recipeBooks: 0, trainingVideos: 0 });
  const [recentPurchases, setRecentPurchases] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [imagesRes, booksRes, videosRes, paymentsRes] = await Promise.all([
          API.get('/images'),
          API.get('/recipe-books'),
          API.get('/training-videos'),
          API.get('/payments/history'),
        ]);
        setStats({
          images: imagesRes.data.length,
          recipeBooks: booksRes.data.length,
          trainingVideos: videosRes.data.length,
        });
        setRecentPurchases(paymentsRes.data.slice(0, 5));
      } catch (err) {
        console.error('Dashboard data error:', err);
      }
    };
    fetchData();
  }, []);

  const sections = [
    {
      title: 'Image Gallery',
      description: 'Browse and download premium baking images',
      icon: HiPhotograph,
      path: '/gallery',
      count: stats.images,
      color: 'from-brand-navy to-brand-navy-dark',
      bg: 'bg-brand-cream',
    },
    {
      title: 'Recipe Books',
      description: 'Unlock professional recipe books in PDF format',
      icon: HiBookOpen,
      path: '/recipe-books',
      count: stats.recipeBooks,
      color: 'from-brand-gold to-brand-gold-soft',
      bg: 'bg-brand-cream',
    },
    {
      title: 'Training Videos',
      description: 'Stream expert baking tutorials',
      icon: HiPlay,
      path: '/training-videos',
      count: stats.trainingVideos,
      color: 'from-brand-midnight to-brand-navy',
      bg: 'bg-brand-cream',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-navy">
          Welcome back, {user?.name || 'Baker'}!
        </h1>
        <p className="font-script text-brand-gold text-xl mt-1">Home of Sweetness</p>
        <p className="text-gray-600 mt-1">Here's what's available for you today.</p>
      </div>

      {/* Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {sections.map((section) => (
          <Link
            key={section.path}
            to={section.path}
            className={`card group ${section.bg} border border-transparent hover:border-brand-gold/30 transition-all`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center`}>
                  <section.icon className="text-2xl text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-400">{section.count}</span>
              </div>
              <h3 className="text-lg font-bold text-brand-navy mb-1">{section.title}</h3>
              <p className="text-gray-500 text-sm mb-4">{section.description}</p>
              <div className="flex items-center text-brand-gold font-semibold text-sm group-hover:translate-x-1 transition-transform">
                <span>Explore</span>
                <HiArrowRight className="ml-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity / Purchased Items */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold text-brand-navy mb-4">Recent Activity</h2>
        {recentPurchases.length > 0 ? (
          <div className="space-y-3">
            {recentPurchases.map((payment) => (
              <div
                key={payment._id}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white
                    ${payment.itemType === 'image' ? 'bg-brand-navy' : payment.itemType === 'recipeBook' ? 'bg-brand-gold' : 'bg-brand-navy-dark'}`}>
                    {payment.itemType === 'image' ? (
                      <HiPhotograph />
                    ) : payment.itemType === 'recipeBook' ? (
                      <HiBookOpen />
                    ) : (
                      <HiPlay />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      {payment.metadata?.itemTitle || `${payment.itemType} purchased`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString()} &middot; KES {payment.amount}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  payment.status === 'success' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                }`}>
                  {payment.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No purchases yet</p>
            <Link to="/gallery" className="btn-primary text-sm">
              Start Exploring
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
