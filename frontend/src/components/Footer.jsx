import { Link } from 'react-router-dom';
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi';

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🧁</span>
              <div>
                <h3 className="text-xl font-bold text-white">Mwiti Bakers</h3>
                <span className="text-sm text-brand-gold">Home of Sweetness</span>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Premium digital bakery content platform. Unlock the sweetness of professional baking
              with our curated collection of images, recipe books, and training videos.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-brand-gold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Home
              </Link>
              <Link to="/gallery" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Gallery
              </Link>
              <Link to="/recipe-books" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Recipe Books
              </Link>
              <Link to="/training-videos" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Training Videos
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-brand-gold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <a href="mailto:hello@mwitibakers.com" className="flex items-center space-x-2 text-gray-300 hover:text-white text-sm transition-colors">
                <HiMail className="text-brand-gold" />
                <span>hello@mwitibakers.com</span>
              </a>
              <a href="tel:+254700000000" className="flex items-center space-x-2 text-gray-300 hover:text-white text-sm transition-colors">
                <HiPhone className="text-brand-gold" />
                <span>+254 700 000 000</span>
              </a>
              <div className="flex items-start space-x-2 text-gray-300 text-sm">
                <HiLocationMarker className="text-brand-gold mt-0.5" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Mwiti Bakers. All rights reserved. | Home of Sweetness
          </p>
        </div>
      </div>
    </footer>
  );
}
