import { useState, useEffect } from 'react';
import API from '../api/axios';
import SEO from '../components/SEO';
import {
  HiBookOpen,
  HiPlay,
  HiPlus,
  HiPencil,
  HiTrash,
  HiX,
  HiEye,
  HiEyeOff,
  HiCash,
  HiUsers,
  HiTrendingUp,
  HiShoppingCart,
} from 'react-icons/hi';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [books, setBooks] = useState([]);
  const [videos, setVideos] = useState([]);
  const [payments, setPayments] = useState([]);
  const [userActivity, setUserActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: HiTrendingUp },
    { id: 'recipeBooks', label: 'Recipe Books', icon: HiBookOpen },
    { id: 'trainingVideos', label: 'Training Videos', icon: HiPlay },
  ];

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    setLoading(true);
    try {
      const [bookRes, vidRes, payRes, usersRes] = await Promise.all([
        API.get('/recipe-books/admin/all'),
        API.get('/training-videos/admin/all'),
        API.get('/payments/admin/all'),
        API.get('/auth/admin/users'),
      ]);
      setBooks(bookRes.data);
      setVideos(vidRes.data);
      setPayments(payRes.data);
      setUserActivity(usersRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Compute stats
  const totalRevenue = payments
    .filter((p) => p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalBuyers = new Set(
    payments.filter((p) => p.status === 'success').map((p) => p.user?._id || p.user)
  ).size;

  const totalSales = payments.filter((p) => p.status === 'success').length;
  const pendingSales = payments.filter((p) => p.status === 'pending').length;
  const totalContent = books.length + videos.length;
  const visibleContent = [books, videos].flat().filter((i) => i.isVisible !== false).length;

  const recentBuyers = [...payments]
    .filter((p) => p.status === 'success')
    .slice(0, 10);

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setFormData({});
    setMessage('');
    setError('');
  };

  const handleEdit = (item) => {
    setEditing(item._id);
    setFormData(item);
    setShowForm(true);
    setMessage('');
    setError('');
  };

  const handleDelete = async (itemType, itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await API.delete(`/${getEndpoint(itemType)}/${itemId}`);
      setMessage('Deleted successfully!');
      fetchAllContent();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleToggleVisibility = async (itemType, itemId, currentVisibility) => {
    try {
      await API.put(`/${getEndpoint(itemType)}/${itemId}`, { isVisible: !currentVisibility });
      fetchAllContent();
    } catch (err) {
      setError('Failed to toggle visibility');
    }
  };

  const handleToggleBestSeller = async (itemType, itemId, currentBestSeller) => {
    try {
      await API.put(`/${getEndpoint(itemType)}/${itemId}`, { isBestSeller: !currentBestSeller });
      fetchAllContent();
    } catch (err) {
      setError('Failed to toggle best seller status');
    }
  };

  const getEndpoint = (type) => {
    switch (type) {
      case 'recipeBooks': return 'recipe-books';
      case 'trainingVideos': return 'training-videos';
      default: return 'recipe-books';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const endpoint = getEndpoint(activeTab);
      const payload = { ...formData };
      delete payload._id;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.__v;
      delete payload.viewCount;
      delete payload.downloadCount;

      if (editing) {
        await API.put(`/${endpoint}/${editing}`, payload);
        setMessage('Updated successfully!');
      } else {
        await API.post(`/${endpoint}`, payload);
        setMessage('Created successfully!');
        resetForm();
      }
      fetchAllContent();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const renderFormFields = () => {
    const fields = {
      recipeBooks: [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'price', label: 'Price (KES)', type: 'number', required: true },
        { name: 'coverImage', label: 'Cover Image URL', type: 'url', required: true },
        { name: 'pdfUrl', label: 'PDF URL', type: 'url', required: true },
        { name: 'pages', label: 'Number of Pages', type: 'number' },
      ],
      trainingVideos: [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'price', label: 'Price (KES)', type: 'number', required: true },
        { name: 'thumbnailUrl', label: 'Thumbnail URL', type: 'url', required: true },
        { name: 'videoUrl', label: 'Video URL (for streaming)', type: 'url', required: true },
        { name: 'duration', label: 'Duration (e.g. 15:30)', type: 'text' },
      ],
    };

    if (!fields[activeTab]) return null;

    return fields[activeTab].map((field) => (
      <div key={field.name}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        {field.type === 'textarea' ? (
          <textarea
            value={formData[field.name] || ''}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            className="input-field resize-none"
            rows="3"
          />
        ) : (
          <input
            type={field.type}
            value={formData[field.name] || ''}
            onChange={(e) => setFormData({ ...formData, [field.name]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
            className="input-field"
            required={field.required}
          />
        )}
      </div>
    ));
  };

  const renderItemCard = (item, index) => (
    <div key={item._id} className="card flex items-center justify-between p-3 sm:p-4">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <span className="text-gray-400 text-xs sm:text-sm w-5 flex-shrink-0">#{index + 1}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-brand-navy text-sm sm:text-base truncate">{item.title}</h4>
          <p className="text-xs sm:text-sm text-gray-500">KES {item.price}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${
          item.isVisible !== false ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {item.isVisible !== false ? 'Visible' : 'Hidden'}
        </span>
      </div>
      <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
        <button
          onClick={() => handleToggleBestSeller(activeTab, item._id, item.isBestSeller)}
          className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
            item.isBestSeller
              ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50'
              : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
          }`}
          title={item.isBestSeller ? 'Remove best seller' : 'Mark as best seller'}
        >
          {item.isBestSeller ? (
            <svg className="text-sm sm:text-base w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ) : (
            <svg className="text-sm sm:text-base w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          )}
        </button>
        <button
          onClick={() => handleToggleVisibility(activeTab, item._id, item.isVisible !== false)}
          className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-brand-navy hover:bg-brand-cream transition-colors"
          title="Toggle visibility"
        >
          {item.isVisible !== false ? <HiEyeOff className="text-sm sm:text-base" /> : <HiEye className="text-sm sm:text-base" />}
        </button>
        <button
          onClick={() => handleEdit(item)}
          className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="Edit"
        >
          <HiPencil className="text-sm sm:text-base" />
        </button>
        <button
          onClick={() => handleDelete(activeTab, item._id)}
          className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <HiTrash className="text-sm sm:text-base" />
        </button>
      </div>
    </div>
  );

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'recipeBooks': return books;
      case 'trainingVideos': return videos;
      default: return [];
    }
  };

  const renderOverviewDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <HiCash className="text-xl text-green-600" />
            </div>
            <HiTrendingUp className="text-green-500 text-lg" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-brand-navy">KES {totalRevenue.toLocaleString()}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Total Revenue</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <HiShoppingCart className="text-xl text-blue-600" />
            </div>
            <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">{totalSales}</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-brand-navy">{totalSales}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Completed Sales</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <HiUsers className="text-xl text-purple-600" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-brand-navy">{totalBuyers}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Unique Buyers</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <HiBookOpen className="text-xl text-amber-600" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-brand-navy">{totalContent}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Total Items ({visibleContent} visible)</p>
        </div>
      </div>

      {/* Content Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <HiBookOpen className="text-lg text-amber-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-brand-navy">{books.length}</p>
              <p className="text-xs text-gray-500">Recipe Books</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: `${(books.length / Math.max(totalContent, 1)) * 100}%` }}></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <HiPlay className="text-lg text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-brand-navy">{videos.length}</p>
              <p className="text-xs text-gray-500">Training Videos</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${(videos.length / Math.max(totalContent, 1)) * 100}%` }}></div>
          </div>
        </div>
      </div>

      {/* Pending Sales */}
      {pendingSales > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center space-x-2 text-amber-700 mb-2">
            <HiShoppingCart className="text-lg" />
            <span className="font-semibold">{pendingSales} pending payment(s)</span>
          </div>
          <p className="text-sm text-amber-600">These payments are waiting for Paystack confirmation.</p>
        </div>
      )}

      {/* Recent Buyers */}
      <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-brand-navy">Recent Buyers</h2>
          <span className="text-xs text-gray-400">{recentBuyers.length} transactions</span>
        </div>
        {recentBuyers.length > 0 ? (
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-sm min-w-[500px] sm:min-w-0">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 font-semibold text-gray-500 whitespace-nowrap">Customer</th>
                  <th className="pb-3 font-semibold text-gray-500 whitespace-nowrap">Item</th>
                  <th className="pb-3 font-semibold text-gray-500 whitespace-nowrap">Amount</th>
                  <th className="pb-3 font-semibold text-gray-500 whitespace-nowrap hidden sm:table-cell">Date</th>
                  <th className="pb-3 font-semibold text-gray-500 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBuyers.map((payment) => (
                  <tr key={payment._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 pr-3">
                      <div className="min-w-0">
                        <p className="font-medium text-brand-navy text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[200px]">
                          {payment.user?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-400 truncate max-w-[120px] sm:max-w-[200px]">{payment.user?.email || ''}</p>
                      </div>
                    </td>
                    <td className="py-3 pr-3">
                      <p className="text-xs sm:text-sm capitalize">{payment.itemType}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[80px] sm:max-w-[150px]">
                        {payment.metadata?.itemTitle || ''}
                      </p>
                    </td>
                    <td className="py-3 pr-3 font-medium text-brand-navy text-xs sm:text-sm whitespace-nowrap">
                      KES {payment.amount}
                    </td>
                    <td className="py-3 pr-3 text-xs text-gray-400 hidden sm:table-cell whitespace-nowrap">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                        payment.status === 'success' ? 'bg-green-50 text-green-700' :
                        payment.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <HiUsers className="text-4xl mx-auto mb-2" />
            <p className="text-sm">No sales yet. Share your content to start earning!</p>
          </div>
        )}
      </div>

      {/* User Activity / Visitors */}
      <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-brand-navy">User Activity</h2>
          <span className="text-xs text-gray-400">{userActivity?.totalUsers || 0} registered</span>
        </div>

        {userActivity ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            <div className="bg-brand-cream rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-brand-navy">{userActivity.totalUsers}</p>
              <p className="text-xs text-gray-500">Total Users</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-green-700">{userActivity.verifiedUsers}</p>
              <p className="text-xs text-gray-500">Verified</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-amber-700">{userActivity.unverifiedUsers}</p>
              <p className="text-xs text-gray-500">Unverified</p>
            </div>
          </div>
        ) : null}

        {userActivity?.recentVisitors?.length > 0 ? (
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-sm min-w-[500px] sm:min-w-0">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 font-semibold text-gray-500 whitespace-nowrap">Name</th>
                  <th className="pb-3 font-semibold text-gray-500 whitespace-nowrap">Email</th>
                  <th className="pb-3 font-semibold text-gray-500 whitespace-nowrap hidden sm:table-cell">Joined</th>
                  <th className="pb-3 font-semibold text-gray-500 whitespace-nowrap">Last Login</th>
                  <th className="pb-3 font-semibold text-gray-500 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {userActivity.recentVisitors.map((visitor) => (
                  <tr key={visitor._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2.5 pr-3">
                      <p className="font-medium text-brand-navy text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[200px]">{visitor.name}</p>
                    </td>
                    <td className="py-2.5 pr-3">
                      <p className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-[200px]">{visitor.email}</p>
                    </td>
                    <td className="py-2.5 pr-3 text-xs text-gray-400 hidden sm:table-cell whitespace-nowrap">
                      {new Date(visitor.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 pr-3">
                      <p className="text-xs text-gray-500 whitespace-nowrap">
                        {visitor.lastLogin
                          ? new Date(visitor.lastLogin).toLocaleDateString() + ' ' + new Date(visitor.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Never'}
                      </p>
                    </td>
                    <td className="py-2.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        visitor.isVerified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {visitor.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400">
            <HiUsers className="text-3xl mx-auto mb-2" />
            <p className="text-sm">No user activity yet.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <SEO title="Admin Dashboard" noindex />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <img
            src="/New.jpg"
            alt="Mwiti Bakers - Premium Baking Content Logo"
            className="h-12 sm:h-14 w-auto object-contain flex-shrink-0"
            loading="lazy"
            decoding="async"
          />
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-brand-navy">Admin Dashboard</h1>
            <p className="text-xs sm:text-base text-gray-600">Manage your Mwiti Bakers platform</p>
          </div>
        </div>
        {activeTab !== 'overview' && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="btn-primary flex items-center space-x-2 text-sm"
          >
            <HiPlus />
            <span>Add New</span>
          </button>
        )}
      </div>

      {message && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 sm:mb-6 flex items-center justify-between text-sm">
          <span>{message}</span>
          <button onClick={() => setMessage('')}><HiX /></button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 sm:mb-6 flex items-center justify-between text-sm">
          <span>{error}</span>
          <button onClick={() => setError('')}><HiX /></button>
        </div>
      )}

      {/* Tab Navigation - Scrollable on mobile */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 mb-6">
        <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm min-w-max sm:min-w-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); resetForm(); }}
              className={`flex items-center space-x-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-navy text-white shadow-md'
                  : 'text-gray-500 hover:text-brand-navy hover:bg-brand-cream'
              }`}
            >
              <tab.icon className="text-base sm:text-lg" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-brand-gold border-t-brand-navy rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <>
          {activeTab === 'overview' ? (
            renderOverviewDashboard()
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Content List */}
              <div className={`${showForm ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
                  <h2 className="text-lg font-bold text-brand-navy mb-4">
                    {tabs.find((t) => t.id === activeTab)?.label || 'Content'}
                  </h2>

                  {getCurrentItems().length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-3xl mb-2">
                        {activeTab === 'recipeBooks' ? '📚' : '🎬'}
                      </p>
                      <p className="text-sm">No items yet. Click "Add New" to create one.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {getCurrentItems().map((item, i) => renderItemCard(item, i))}
                    </div>
                  )}
                </div>
              </div>

              {/* Add/Edit Form */}
              {showForm && (
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 sticky top-20">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-brand-navy">
                        {editing ? 'Edit' : 'Add New'}
                      </h2>
                      <button
                        onClick={resetForm}
                        className="p-2 rounded-lg hover:bg-brand-cream text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <HiX />
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {renderFormFields()}
                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          disabled={saving}
                          className="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center text-sm"
                        >
                          {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                        </button>
                        <button
                          type="button"
                          onClick={resetForm}
                          className="btn-outline flex-1 text-center text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
    </>
  );
}
