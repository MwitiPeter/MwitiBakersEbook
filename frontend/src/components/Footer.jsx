import { Link } from 'react-router-dom';
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi';
import { FaFacebook, FaInstagram, FaTiktok, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center justify-center bg-white/10 rounded-xl p-2 mb-4">
              <img
                src="/New.jpg"
                alt="Mwiti Bakers"
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              Premium digital bakery content platform. Unlock the sweetness of professional baking
              with our curated collection of recipe books and training videos.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-brand-gold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Home
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
              <a href="mailto:mwitibakers@gmail.com" className="flex items-center space-x-2 text-gray-300 hover:text-white text-sm transition-colors">
                <HiMail className="text-brand-gold text-lg" />
                <span>mwitibakers@gmail.com</span>
              </a>
              <a href="tel:+254757365203" className="flex items-center space-x-2 text-gray-300 hover:text-white text-sm transition-colors">
                <HiPhone className="text-brand-gold text-lg" />
                <span>0757365203</span>
              </a>
              <div className="flex flex-wrap gap-2 text-gray-300 text-sm">
                <span className="flex items-center space-x-1"><HiLocationMarker className="text-brand-gold text-base" /><span>Embu</span></span>
                <span className="text-gray-500">·</span>
                <span className="flex items-center space-x-1"><HiLocationMarker className="text-brand-gold text-base" /><span>Makueni</span></span>
                <span className="text-gray-500">·</span>
                <span className="flex items-center space-x-1"><HiLocationMarker className="text-brand-gold text-base" /><span>Nairobi</span></span>
              </div>
            </div>

            <h4 className="font-semibold text-brand-gold mb-3 mt-6">Follow Us</h4>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://instagram.com/mwiti_bakers"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-white/10 hover:bg-pink-600 text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm transition-all duration-200"
                title="Instagram"
              >
                <FaInstagram className="text-lg" />
                <span>@mwiti_bakers</span>
              </a>
              <a
                href="https://tiktok.com/@mwiti_bakers"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-white/10 hover:bg-black text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm transition-all duration-200"
                title="TikTok"
              >
                <FaTiktok className="text-lg" />
                <span>@mwiti_bakers</span>
              </a>
              <a
                href="https://linkedin.com/company/mwiti-bakers"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-white/10 hover:bg-blue-700 text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm transition-all duration-200"
                title="LinkedIn"
              >
                <FaLinkedin className="text-lg" />
                <span>Mwiti Bakers</span>
              </a>
              <a
                href="https://facebook.com/mwiti.bakers"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-white/10 hover:bg-blue-600 text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm transition-all duration-200"
                title="Facebook"
              >
                <FaFacebook className="text-lg" />
                <span>mwiti.bakers</span>
              </a>
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
