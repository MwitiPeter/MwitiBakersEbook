import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMenu, HiX, HiLogout, HiCog } from 'react-icons/hi';
import Logo from './Logo';
import { SocialIconsLight } from './SocialIcons';
import { NAV_SECTIONS, WHATSAPP_URL } from '../constants/brand';
import { scrollToSection as goToSection } from '../utils/scrollToSection';
import { FaWhatsapp } from 'react-icons/fa';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const handleNavClick = () => setIsOpen(false);

  const scrollToSection = (href) => {
    setIsOpen(false);
    goToSection(href, navigate, location.pathname);
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white shadow-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18 items-center py-2">
          <Logo size="md" />

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_SECTIONS.map(({ label, href }) => (
              <button
                key={href}
                onClick={() => scrollToSection(href)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600
                  hover:text-brand-navy hover:bg-brand-cream transition-all duration-200"
              >
                {label}
              </button>
            ))}
            {user && (
              <>
                <Link
                  to="/gallery"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/gallery')
                      ? 'bg-brand-navy text-white'
                      : 'text-gray-600 hover:text-brand-navy hover:bg-brand-cream'
                  }`}
                >
                  Gallery
                </Link>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/dashboard')
                      ? 'bg-brand-navy text-white'
                      : 'text-gray-600 hover:text-brand-navy hover:bg-brand-cream'
                  }`}
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>

          {/* Desktop Right */}
          <div className="hidden lg:flex items-center gap-3">
            <SocialIconsLight size="sm" />
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold text-sm py-2 px-4 inline-flex items-center gap-2"
            >
              <FaWhatsapp className="text-lg" />
              Order Now
            </a>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      location.pathname.startsWith('/admin')
                        ? 'bg-brand-gold text-brand-midnight'
                        : 'text-gray-600 hover:text-brand-gold hover:bg-brand-cream'
                    }`}
                  >
                    <HiCog className="text-lg" />
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                >
                  <HiLogout className="text-lg" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline text-sm py-2 px-4">
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg text-brand-navy hover:bg-brand-cream transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <HiX className="text-2xl" /> : <HiMenu className="text-2xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 pb-6 animate-fade-in">
          <div className="px-4 pt-4 flex flex-col items-center border-b border-gray-100 pb-4 mb-2">
            <Logo size="lg" showTagline />
          </div>
          <div className="px-4 space-y-1 pt-2">
            {NAV_SECTIONS.map(({ label, href }) => (
              <button
                key={href}
                onClick={() => scrollToSection(href)}
                className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-brand-cream hover:text-brand-navy transition-all"
              >
                {label}
              </button>
            ))}
            {user && (
              <>
                <Link
                  to="/gallery"
                  onClick={handleNavClick}
                  className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-brand-cream"
                >
                  Gallery
                </Link>
                <Link
                  to="/dashboard"
                  onClick={handleNavClick}
                  className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-brand-cream"
                >
                  Dashboard
                </Link>
              </>
            )}
            <hr className="my-3 border-gray-100" />
            <div className="flex justify-center py-2">
              <SocialIconsLight size="md" />
            </div>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp w-full text-center mt-2"
            >
              <FaWhatsapp className="text-xl" />
              Order on WhatsApp
            </a>
            <hr className="my-3 border-gray-100" />
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={handleNavClick}
                    className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-brand-cream"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={handleNavClick}
                  className="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-medium text-brand-navy border border-brand-navy hover:bg-brand-cream"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={handleNavClick}
                  className="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-medium bg-brand-navy text-white"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
