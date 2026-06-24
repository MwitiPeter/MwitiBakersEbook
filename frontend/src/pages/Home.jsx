import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { HiArrowRight, HiBookOpen, HiPlay } from 'react-icons/hi';

export default function Home() {
  const { user } = useAuth();
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactError, setContactError] = useState('');

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactError('');
    setContactSubmitting(true);
    try {
      await API.post('/contact', contactForm);
      setContactSent(true);
      setContactForm({ name: '', email: '', message: '' });
    } catch (err) {
      setContactError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-brand-navy overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl">🧁</div>
          <div className="absolute bottom-10 right-10 text-8xl">🥐</div>
          <div className="absolute top-1/2 left-1/3 text-6xl">🍰</div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center bg-white/10 rounded-full px-4 py-1.5 text-white/80 text-sm mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              Premium Digital Bakery
            </div>
            <div className="flex justify-center mb-6">
              <img
                src="/New.jpg"
                alt="Mwiti Bakers"
                className="h-20 sm:h-24 md:h-28 w-auto object-contain drop-shadow-lg"
              />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
              Welcome to{' '}
              <span className="text-brand-gold">Mwiti Bakers</span>
            </h1>
            <p className="text-xl md:text-2xl text-brand-gold font-semibold mb-4">Home of Sweetness</p>
            <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Discover the art of premium baking through our curated collection of
              professional recipe books and expert training videos. Your journey to baking excellence
              starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/dashboard" className="btn-gold text-lg px-8 py-4 inline-flex items-center justify-center space-x-2">
                  <span>Go to Dashboard</span>
                  <HiArrowRight />
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="btn-gold text-lg px-8 py-4 inline-flex items-center justify-center space-x-2">
                    <span>Get Started</span>
                    <HiArrowRight />
                  </Link>
                  <Link to="/login" className="bg-white/10 text-white border-2 border-white/20 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/20 transition-all inline-flex items-center justify-center">
                    I Already Have an Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-brand-cream to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">What We Offer</h2>
            <p className="section-subtitle">Unlock premium baking content at your fingertips</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Recipe Books */}
            <div className="card p-8 text-center group">
              <div className="w-16 h-16 bg-brand-navy/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-navy/10 transition-colors">
                <HiBookOpen className="text-3xl text-brand-navy" />
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-3">Recipe Books</h3>
              <p className="text-gray-600 mb-6">
                Download expertly crafted recipe books filled with detailed baking instructions,
                tips, and techniques from professional bakers.
              </p>
              <Link
                to={user ? '/recipe-books' : '/signup'}
                className="text-brand-gold font-semibold hover:text-yellow-700 transition-colors inline-flex items-center space-x-1"
              >
                <span>View Recipe Books</span>
                <HiArrowRight className="text-sm" />
              </Link>
            </div>

            {/* Training Videos */}
            <div className="card p-8 text-center group">
              <div className="w-16 h-16 bg-brand-navy/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-navy/10 transition-colors">
                <HiPlay className="text-3xl text-brand-navy" />
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-3">Training Videos</h3>
              <p className="text-gray-600 mb-6">
                Watch professional baking tutorials and masterclasses. Learn at your own pace with
                our streaming video library.
              </p>
              <Link
                to={user ? '/training-videos' : '/signup'}
                className="text-brand-gold font-semibold hover:text-yellow-700 transition-colors inline-flex items-center space-x-1"
              >
                <span>Watch Videos</span>
                <HiArrowRight className="text-sm" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-brand-gold font-semibold text-sm uppercase tracking-wider">About Us</span>
              <h2 className="section-title mt-2">Our Story</h2>
              <div className="w-20 h-1 bg-brand-gold rounded-full mt-4 mb-6"></div>
              <p className="text-gray-600 leading-relaxed mb-6">
                Mwiti Bakers was born from a passion for the art of baking and a vision to share
                that knowledge with the world. We believe that everyone deserves access to
                premium baking education and inspiration.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Our platform connects baking enthusiasts with professional-grade content —
                from comprehensive recipe books to in-depth
                video training. Every piece of content is curated to help you elevate your
                baking skills.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                <div className="bg-brand-cream rounded-2xl p-5 sm:p-6">
                  <h4 className="text-2xl sm:text-3xl font-bold text-brand-navy">Our Mission</h4>
                  <p className="text-gray-500 text-sm mt-2 leading-relaxed">To make premium baking education accessible to everyone</p>
                </div>
                <div className="bg-brand-cream rounded-2xl p-5 sm:p-6">
                  <h4 className="text-2xl sm:text-3xl font-bold text-brand-navy">Our Vision</h4>
                  <p className="text-gray-500 text-sm mt-2 leading-relaxed">To be Africa's leading digital bakery content platform</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-brand-cream rounded-3xl p-8 relative">
                <div className="text-8xl text-center mb-4">🥖</div>
                <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                  <p className="text-gray-600 leading-relaxed">
                    We are building Africa's leading digital bakery content platform — with curated
                    recipe books and expert training videos for baking enthusiasts at every level.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Get In Touch</h2>
            <p className="section-subtitle">Have questions? We'd love to hear from you</p>
          </div>
          <div className="max-w-lg mx-auto">
            <form className="space-y-4" onSubmit={handleContactSubmit}>
              <input
                type="text"
                placeholder="Your Name"
                className="input-field"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Your Email"
                className="input-field"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                required
              />
              <textarea
                rows="4"
                placeholder="Your Message"
                className="input-field resize-none"
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                required
              ></textarea>
              <button type="submit" className="btn-primary w-full" disabled={contactSubmitting}>
                {contactSubmitting ? 'Sending...' : contactSent ? 'Message Sent!' : 'Send Message'}
              </button>
              {contactError && (
                <p className="text-red-500 text-sm text-center mt-2">{contactError}</p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand-navy">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Baking Journey?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Join Mwiti Bakers today and unlock a world of premium baking content.
          </p>
          {!user && (
            <Link to="/signup" className="btn-gold text-lg px-10 py-4 inline-flex items-center space-x-2">
              <span>Create Free Account</span>
              <HiArrowRight />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
