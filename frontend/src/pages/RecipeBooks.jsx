import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import ImageWithFallback from '../components/ImageWithFallback';
import SEO from '../components/SEO';
import { HiLockClosed, HiDownload, HiEye, HiX, HiBookOpen } from 'react-icons/hi';

export default function RecipeBooks() {
  const [searchParams] = useSearchParams();
  const redirectItemId = searchParams.get('itemId');

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchasedIds, setPurchasedIds] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data } = await API.get('/recipe-books');
        setBooks(data);
        const userRes = await API.get('/auth/me');
        const ids = userRes.data.purchasedItems?.recipeBooks?.map((b) => b._id || b) || [];
        setPurchasedIds(ids);

        // If redirected from payment callback, auto-open the purchased item
        if (redirectItemId) {
          const purchased = data.find((b) => b._id === redirectItemId);
          if (purchased) {
            handleViewDetail(purchased);
          }
        }
      } catch (err) {
        console.error('Error fetching recipe books:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [redirectItemId]);

  const handlePurchase = async (book) => {
    setError('');
    setPurchasing(true);
    try {
      const { data } = await API.post('/payments/initialize', {
        itemType: 'recipeBook',
        itemId: book._id,
      });
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      setPurchasing(false);
    }
  };

  const handleViewDetail = async (book) => {
    if (purchasedIds.includes(book._id)) {
      try {
        const { data } = await API.get(`/recipe-books/${book._id}/unlock`);
        setSelectedBook(data);
      } catch (err) {
        console.error('Error unlocking book:', err);
      }
    } else {
      setSelectedBook({ ...book, isLocked: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-gold border-t-brand-navy rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading recipe books...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Recipe Books"
        description="Browse and download professional baking recipe books from Mwiti Bakers. Expert techniques, detailed instructions, and premium baking content."
        url="https://mwitibakers.com/recipe-books"
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
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-navy">Recipe Books</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-2xl mx-auto">
          Download professional baking recipe books filled with expert techniques.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm max-w-md mx-auto">
          {error}
        </div>
      )}

      {books.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-6xl">📚</span>
          <p className="text-gray-400 mt-4 text-lg">No recipe books available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {books.map((book) => (
            <div
              key={book._id}
              className="card group cursor-pointer"
              onClick={() => handleViewDetail(book)}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                <ImageWithFallback
                  src={book.coverImage}
                  alt={book.title}
                  type="book"
                  className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                    !purchasedIds.includes(book._id) ? 'blur-lg' : ''
                  }`}
                />
                {!purchasedIds.includes(book._id) && (
                  <>
                    <div className="absolute inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center">
                      <div className="bg-white/90 rounded-full p-3 shadow-lg">
                        <HiLockClosed className="text-xl sm:text-2xl text-brand-navy" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-brand-navy/5"></div>
                  </>
                )}
                <div className="absolute top-3 right-3 bg-brand-navy text-white text-xs font-bold px-2 py-1 rounded-full">
                  KES {book.price}
                </div>
                {book.pages > 0 && (
                  <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    {book.pages} pages
                  </div>
                )}
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="font-semibold text-brand-navy text-sm sm:text-base truncate">{book.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">{book.description || 'No description'}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleViewDetail(book); }}
                    className="flex-1 text-xs sm:text-sm bg-brand-cream text-brand-navy py-2 rounded-lg font-medium hover:bg-brand-navy hover:text-white transition-colors flex items-center justify-center space-x-1"
                  >
                    <HiEye className="text-sm" />
                    <span>Preview</span>
                  </button>
                  {purchasedIds.includes(book._id) ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleViewDetail(book); }}
                      className="flex-1 text-xs sm:text-sm bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
                    >
                      <HiDownload className="text-sm" />
                      <span>Read</span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePurchase(book); }}
                      disabled={purchasing}
                      className="flex-1 text-xs sm:text-sm bg-brand-gold text-white py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50"
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
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60" onClick={() => setSelectedBook(null)}>
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto m-2 sm:m-4" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <button
                onClick={() => setSelectedBook(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-white/90 rounded-full p-1.5 sm:p-2 hover:bg-white shadow-lg transition-colors"
              >
                <HiX className="text-lg sm:text-xl" />
              </button>
              <div className="relative aspect-[3/4] bg-gray-100">
                <ImageWithFallback
                  src={selectedBook.coverImage}
                  alt={selectedBook.title}
                  type="book"
                  className={`w-full h-full object-contain ${selectedBook.isLocked ? 'blur-lg' : ''}`}
                />
                {selectedBook.isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-4">
                      <HiLockClosed className="text-4xl sm:text-5xl text-white mb-2 mx-auto" />
                      <p className="text-white font-semibold text-sm sm:text-base">Unlock to read this recipe book</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex items-center space-x-2 text-brand-navy mb-2">
                <HiBookOpen />
                <span className="text-sm font-medium">{selectedBook.pages || '?'} pages</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-navy">{selectedBook.title}</h2>
              <p className="text-sm sm:text-base text-gray-600 mt-2">{selectedBook.description}</p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
                <span className="text-xl sm:text-2xl font-bold text-brand-gold">KES {selectedBook.price}</span>
                {selectedBook.isLocked ? (
                  <button
                    onClick={() => handlePurchase(selectedBook)}
                    disabled={purchasing}
                    className="btn-gold w-full sm:w-auto disabled:opacity-50 text-center"
                  >
                    {purchasing ? 'Processing...' : 'Unlock Now'}
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <a
                      href={selectedBook.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary flex items-center justify-center space-x-2"
                    >
                      <HiBookOpen />
                      <span>Read Online</span>
                    </a>
                    <a
                      href={selectedBook.pdfUrl}
                      download
                      className="btn-gold flex items-center justify-center space-x-2"
                    >
                      <HiDownload />
                      <span>Download PDF</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
