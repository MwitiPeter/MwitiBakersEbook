import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiMail, HiGlobeAlt } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import SocialIcons from './SocialIcons';
import { CONTACT, WHATSAPP_URL, NAV_SECTIONS } from '../constants/brand';
import { scrollToSection as goToSection } from '../utils/scrollToSection';

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (href) => {
    goToSection(href, navigate, location.pathname);
  };

  return (
    <footer className="bg-brand-midnight text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <img
                src="/logo.jpg"
                alt="Mwiti Bakers Logo"
                className="h-16 w-16 rounded-full object-cover shadow-gold"
              />
              <div>
                <h3 className="text-xl font-bold text-white">Mwiti Bakers</h3>
                <span className="font-script text-brand-gold text-sm">Home of Sweetness</span>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-5">
              Crafting premium baked goods and unforgettable celebrations. Quality, trust, and
              sweetness in every bite.
            </p>
            <SocialIcons size="sm" />
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-brand-gold mb-5 text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <div className="space-y-2.5">
              {NAV_SECTIONS.map(({ label, href }) => (
                <button
                  key={href}
                  onClick={() => scrollToSection(href)}
                  className="block text-gray-300 hover:text-brand-gold text-sm transition-colors text-left"
                >
                  {label}
                </button>
              ))}
              <Link
                to="/gallery"
                className="block text-gray-300 hover:text-brand-gold text-sm transition-colors"
              >
                Cake Gallery
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-brand-gold mb-5 text-sm uppercase tracking-wider">
              Contact Us
            </h4>
            <div className="space-y-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-300 hover:text-brand-gold text-sm transition-colors"
              >
                <FaWhatsapp className="text-brand-gold text-lg flex-shrink-0" />
                <span>{CONTACT.phone}</span>
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-2 text-gray-300 hover:text-brand-gold text-sm transition-colors"
              >
                <HiMail className="text-brand-gold text-lg flex-shrink-0" />
                <span>{CONTACT.email}</span>
              </a>
              <a
                href={CONTACT.websiteUrl}
                className="flex items-center gap-2 text-gray-300 hover:text-brand-gold text-sm transition-colors"
              >
                <HiGlobeAlt className="text-brand-gold text-lg flex-shrink-0" />
                <span>{CONTACT.website}</span>
              </a>
            </div>
          </div>

          {/* Order CTA */}
          <div>
            <h4 className="font-semibold text-brand-gold mb-5 text-sm uppercase tracking-wider">
              Order Today
            </h4>
            <p className="text-gray-300 text-sm mb-5 leading-relaxed">
              Ready to celebrate? Order your custom cake or bakery treats via WhatsApp — fast,
              easy, and personal.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold inline-flex items-center gap-2 text-sm"
            >
              <FaWhatsapp className="text-lg" />
              Order on WhatsApp
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm text-center sm:text-left">
            &copy; {new Date().getFullYear()} Mwiti Bakers. All rights reserved.
          </p>
          <p className="font-script text-brand-gold text-lg">Home of Sweetness</p>
        </div>
      </div>
    </footer>
  );
}
