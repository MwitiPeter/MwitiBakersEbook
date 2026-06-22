import { useState, useEffect } from 'react';
import API from '../api/axios';
import {
  HiPhotograph,
  HiBookOpen,
  HiPlay,
  HiPlus,
  HiPencil,
  HiTrash,
  HiX,
  HiEye,
  HiEyeOff,
} from 'react-icons/hi';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('images');
  const [images, setImages] = useState([]);
  const [books, setBooks] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const tabs = [
    { id: 'images', label: 'Images', icon: HiPhotograph },
    { id: 'recipeBooks', label: 'Recipe Books', icon: HiBookOpen },
    { id: 'trainingVideos', label: 'Training Videos', icon: HiPlay },
  ];

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    setLoading(true);
    try {
      const [imgRes, bookRes, vidRes] = await Promise.all([
        API.get('/images/admin/all'),
        API.get('/recipe-books/admin/all'),
        API.get('/training-videos/admin/all'),
      ]);
      setImages(imgRes.data);
      setBooks(bookRes.data);
      setVideos(vidRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const getEndpoint = (type) => {
    switch (type) {
      case 'images': return 'images';
      case 'recipeBooks': return 'recipe-books';
      case 'trainingVideos': return 'training-videos';
      default: return 'images';
    }
  };

  const getItemTypeForApi = (type) => {
    switch (type) {
      case 'images': return 'image';
      case 'recipeBooks': return 'recipeBook';
      case 'trainingVideos': return 'trainingVideo';
      default: return 'image';
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
      images: [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'price', label: 'Price (KES)', type: 'number', required: true },
        { name: 'previewUrl', label: 'Preview Image URL', type: 'url', required: true },
        { name: 'fullUrl', label: 'Full Image URL', type: 'url', required: true },
      ],
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

    return fields[activeTab]?.map((field) => (
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
    <div key={item._id} className="card flex items-center justify-between p-4">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <span className="text-gray-400 text-sm w-6">#{index + 1}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-brand-navy truncate">{item.title}</h4>
          <p className="text-sm text-gray-500">KES {item.price}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
          item.isVisible !== false ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {item.isVisible !== false ? 'Visible' : 'Hidden'}
        </span>
      </div>
      <div className="flex items-center space-x-2 ml-4">
        <button
          onClick={() => handleToggleVisibility(activeTab, item._id, item.isVisible !== false)}
          className="p-2 rounded-lg text-gray-400 hover:text-brand-navy hover:bg-brand-cream transition-colors"
          title="Toggle visibility"
        >
          {item.isVisible !== false ? <HiEyeOff /> : <HiEye />}
        </button>
        <button
          onClick={() => handleEdit(item)}
          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="Edit"
        >
          <HiPencil />
        </button>
        <button
          onClick={() => handleDelete(activeTab, item._id)}
          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <HiTrash />
        </button>
      </div>
    </div>
  );

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'images': return images;
      case 'recipeBooks': return books;
      case 'trainingVideos': return videos;
      default: return [];
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Admin Dashboard</h1>
          <p className="text-gray-600">Manage all content on Mwiti Bakers</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="btn-primary flex items-center space-x-2"
        >
          <HiPlus />
          <span>Add New</span>
        </button>
      </div>

      {message && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')}><HiX /></button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')}><HiX /></button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); resetForm(); }}
            className={`flex items-center space-x-2 px-5 py-3 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
              activeTab === tab.id
                ? 'bg-brand-navy text-white shadow-md'
                : 'text-gray-500 hover:text-brand-navy hover:bg-brand-cream'
            }`}
          >
            <tab.icon className="text-lg" />
            <span>{tab.label}</span>
            {tab.id === 'images' && images.length > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {images.length}
              </span>
            )}
            {tab.id === 'recipeBooks' && books.length > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {books.length}
              </span>
            )}
            {tab.id === 'trainingVideos' && videos.length > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {videos.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content List */}
        <div className={`${showForm ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-brand-navy mb-4">
              {tabs.find((t) => t.id === activeTab)?.label || 'Content'}
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-brand-gold border-t-brand-navy rounded-full animate-spin mx-auto"></div>
              </div>
            ) : getCurrentItems().length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-4xl mb-2">
                  {activeTab === 'images' ? '🖼️' : activeTab === 'recipeBooks' ? '📚' : '🎬'}
                </p>
                <p>No items yet. Click "Add New" to create one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {getCurrentItems().map((item, i) => renderItemCard(item, i))}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-brand-navy">
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
                    className="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center"
                  >
                    {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-outline flex-1 text-center"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
