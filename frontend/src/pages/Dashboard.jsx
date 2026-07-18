import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import { HiBookOpen, HiPlay, HiArrowRight, HiExternalLink } from 'react-icons/hi';
import { useState, useEffect } from 'react';
import API from '../api/axios';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ recipeBooks: 0, trainingVideos: 0 });
  const [purchasedItems, setPurchasedItems] = useState({ recipeBooks: [], trainingVideos: [] });
  const [recentPurchases, setRecentPurchases] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, videosRes, paymentsRes, userRes] = await Promise.all([
          API.get('/recipe-books'),
          API.get('/training-videos'),
          API.get('/payments/history'),
          API.get('/auth/me'),
        ]);

        const allBooks = booksRes.data;
        const allVideos = videosRes.data;
        const purchasedIds = userRes.data.purchasedItems;

        setStats({
          recipeBooks: allBooks.length,
          trainingVideos: allVideos.length,
        });

        // Filter purchased items with full data
        if (purchasedIds) {
          setPurchasedItems({
            recipeBooks: allBooks.filter((book) => purchasedIds.recipeBooks?.some((id) => id._id === book._id || id === book._id)),
            trainingVideos: allVideos.filter((video) => purchasedIds.trainingVideos?.some((id) => id._id === video._id || id === video._id)),
          });
        }

        setRecentPurchases(paymentsRes.data);
      } catch (err) {
        console.error('Dashboard data error:', err);
      }
    };
    fetchData();
  }, []);

  const getPurchasedCount = (type) => purchasedItems[type]?.length || 0;

  const sections = [
    {
      title: 'Recipe Books',
      description: 'Unlock professional recipe books in PDF format',
      icon: HiBookOpen,
      path: '/recipe-books',
      total: stats.recipeBooks,
      purchased: getPurchasedCount('recipeBooks'),
      color: 'from-amber-500 to-yellow-700',
      bg: 'bg-amber-50',
    },
    {
      title: 'Training Videos',
      description: 'Stream expert baking tutorials',
      icon: HiPlay,
      path: '/training-videos',
      total: stats.trainingVideos,
      purchased: getPurchasedCount('trainingVideos'),
      color: 'from-emerald-500 to-emerald-700',
      bg: 'bg-emerald-50',
    },
  ];

  const hasPurchases = purchasedItems.recipeBooks.length > 0 || purchasedItems.trainingVideos.length > 0;

  const getItemLink = (type, id) => {
    switch (type) {
      case 'recipeBooks': return `/recipe-books?itemId=${id}`;
      case 'trainingVideos': return `/training-videos?itemId=${id}`;
      default: return '/dashboard';
    }
  };

  const getItemTypeIcon = (type) => {
    switch (type) {
      case 'recipeBooks': return { icon: HiBookOpen, color: 'bg-amber-600' };
      case 'trainingVideos': return { icon: HiPlay, color: 'bg-emerald-600' };
      default: return { icon: HiPlay, color: 'bg-gray-600' };
    }
  };

  return (
    <>
      <SEO title="Dashboard" noindex />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fade-in">
      {/* Welcome */}
      <div className="mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        <img
          src="/New.jpg"
          alt="Mwiti Bakers - Premium Baking Content Logo"
          className="h-14 sm:h-16 w-auto object-contain flex-shrink-0"
          loading="lazy"
          decoding="async"
        />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy text-center sm:text-left">
            Welcome back, {user?.name || 'Baker'}!
          </h1>
          <p className="text-gray-600 mt-1 text-center sm:text-left">Here's what's available for you today.</p>
        </div>
      </div>

      {/* Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-3xl mx-auto">
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
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-400">{section.total}</span>
                  {section.purchased > 0 && (
                    <p className="text-xs text-green-600 font-medium">
                      {section.purchased} purchased
                    </p>
                  )}
                </div>
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

      {/* My Purchased Items */}
      {hasPurchases && (
        <div className="mb-12">
          <h2 className="text-xl font-bold text-brand-navy mb-6">My Purchased Items</h2>

          <div className="space-y-3">
            {/* Purchased Recipe Books */}
            {purchasedItems.recipeBooks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-2 flex items-center space-x-2">
                  <HiBookOpen className="text-lg" />
                  <span>Recipe Books ({purchasedItems.recipeBooks.length})</span>
                </h3>
                <div className="space-y-1">
                  {purchasedItems.recipeBooks.map((item) => (
                    <Link
                      key={item._id}
                      to={getItemLink('recipeBooks', item._id)}
                      className="flex items-center space-x-2 py-2 px-3 rounded-lg text-sm text-gray-700 hover:text-amber-700 hover:bg-amber-50 transition-all group"
                    >
                      <HiBookOpen className="text-amber-500 text-base shrink-0" />
                      <span className="truncate group-hover:underline">{item.title}</span>
                      <HiExternalLink className="text-gray-400 text-xs shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Purchased Training Videos */}
            {purchasedItems.trainingVideos.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-2 flex items-center space-x-2">
                  <HiPlay className="text-lg" />
                  <span>Training Videos ({purchasedItems.trainingVideos.length})</span>
                </h3>
                <div className="space-y-1">
                  {purchasedItems.trainingVideos.map((item) => (
                    <Link
                      key={item._id}
                      to={getItemLink('trainingVideos', item._id)}
                      className="flex items-center space-x-2 py-2 px-3 rounded-lg text-sm text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 transition-all group"
                    >
                      <HiPlay className="text-emerald-500 text-base shrink-0" />
                      <span className="truncate group-hover:underline">{item.title}</span>
                      <HiExternalLink className="text-gray-400 text-xs shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Payment History */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold text-brand-navy mb-4">Payment History</h2>
        {recentPurchases.length > 0 ? (
          <div className="space-y-2">
            {recentPurchases.map((payment) => {
              const typeInfo = getItemTypeIcon(
                payment.itemType === 'recipeBook' ? 'recipeBooks' : 'trainingVideos'
              );
              const itemLink = getItemLink(
                payment.itemType === 'recipeBook' ? 'recipeBooks' : 'trainingVideos',
                payment.itemId
              );
              return (
                <Link
                  key={payment._id}
                  to={itemLink}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-3 px-3 rounded-xl border border-gray-100 hover:border-brand-gold/30 hover:bg-brand-cream/50 transition-all gap-2 sm:gap-0"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0 ${typeInfo.color}`}>
                      <typeInfo.icon className="text-lg" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-800 text-sm truncate">
                        {payment.metadata?.itemTitle || `${payment.itemType.replace(/([A-Z])/g, ' $1').trim()} purchased`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString()} &middot; KES {payment.amount?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                      payment.status === 'success' ? 'bg-green-50 text-green-700' :
                      payment.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {payment.status === 'success' ? 'Completed' : payment.status}
                    </span>
                    <HiExternalLink className="text-gray-400 text-sm flex-shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No purchases yet</p>
            <Link to="/recipe-books" className="btn-primary text-sm">
              Start Exploring
            </Link>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
