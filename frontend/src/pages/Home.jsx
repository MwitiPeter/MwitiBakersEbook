import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiArrowRight,
  HiStar,
  HiCheckCircle,
  HiMail,
  HiGlobeAlt,
  HiChevronDown,
} from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import { SocialIconsLight } from '../components/SocialIcons';
import { CONTACT, WHATSAPP_URL } from '../constants/brand';

const FEATURED_CAKES = [
  {
    name: 'Celebration Tier Cake',
    description: 'Elegant multi-tier design perfect for weddings and milestones.',
    price: 'From KES 8,500',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop',
  },
  {
    name: 'Birthday Bliss Cake',
    description: 'Vibrant, personalized cakes that make every birthday unforgettable.',
    price: 'From KES 4,500',
    image: 'https://images.unsplash.com/photo-1464349095432-e22fb228d589?w=600&h=400&fit=crop',
  },
  {
    name: 'Luxury Chocolate Delight',
    description: 'Rich, decadent chocolate layers crafted for true connoisseurs.',
    price: 'From KES 5,000',
    image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&h=400&fit=crop',
  },
  {
    name: 'Floral Elegance Cake',
    description: 'Hand-piped floral artistry for sophisticated celebrations.',
    price: 'From KES 7,000',
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&h=400&fit=crop',
  },
];

const BAKERY_PRODUCTS = [
  { name: 'Fresh Bread Loaves', emoji: '🍞', description: 'Soft, daily-baked artisan bread.' },
  { name: 'Pastries & Croissants', emoji: '🥐', description: 'Buttery, flaky perfection every morning.' },
  { name: 'Cupcakes & Muffins', emoji: '🧁', description: 'Individual treats for every occasion.' },
  { name: 'Cookies & Biscuits', emoji: '🍪', description: 'Crunchy, chewy, and irresistibly sweet.' },
  { name: 'Pies & Tarts', emoji: '🥧', description: 'Classic flavors with a premium twist.' },
  { name: 'Custom Dessert Boxes', emoji: '🎁', description: 'Curated assortments for gifting.' },
];

const WHY_CHOOSE_US = [
  {
    title: 'Premium Ingredients',
    description: 'Only the finest, freshest ingredients go into every creation.',
    icon: '✨',
  },
  {
    title: 'Expert Craftsmanship',
    description: 'Years of baking expertise in every detail and decoration.',
    icon: '👨‍🍳',
  },
  {
    title: 'Custom Designs',
    description: 'Your vision brought to life with personalized cake artistry.',
    icon: '🎨',
  },
  {
    title: 'Timely Delivery',
    description: 'Reliable, on-time delivery for your special moments.',
    icon: '🚚',
  },
  {
    title: 'Celebration Focused',
    description: 'We make every occasion sweeter and more memorable.',
    icon: '🎉',
  },
  {
    title: 'Trusted Quality',
    description: 'Hundreds of happy customers across Kenya trust us.',
    icon: '💎',
  },
];

const TESTIMONIALS = [
  {
    name: 'Grace M.',
    text: 'The wedding cake was absolutely stunning! Every guest asked who made it. Mwiti Bakers exceeded all expectations.',
    rating: 5,
  },
  {
    name: 'James K.',
    text: 'Ordered a custom birthday cake for my daughter — she was over the moon! Beautiful design and delicious taste.',
    rating: 5,
  },
  {
    name: 'Sarah W.',
    text: 'Their pastries are the best in town. Fresh, premium quality, and always delivered on time. Highly recommend!',
    rating: 5,
  },
];

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1586985289688-ca3cf47d3d6e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1558961363-fa8fdf82db3b?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=400&fit=crop',
];

const FAQS = [
  {
    q: 'How do I place a custom cake order?',
    a: 'Simply click the WhatsApp button and send us your requirements — occasion, size, flavor, design ideas, and delivery date. We will respond promptly with a quote.',
  },
  {
    q: 'How far in advance should I order?',
    a: 'We recommend ordering custom cakes at least 5–7 days in advance. For large events or wedding cakes, please book 2–4 weeks ahead.',
  },
  {
    q: 'Do you deliver across Nairobi?',
    a: 'Yes! We offer delivery across Nairobi and surrounding areas. Delivery fees depend on location and will be confirmed when you order.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept M-Pesa, bank transfer, and cash on delivery for select orders. Payment details are shared when your order is confirmed.',
  },
  {
    q: 'Can I see your digital recipe books and training videos?',
    a: 'Yes! Create a free account to access our premium digital bakery content including recipe books, training videos, and an exclusive image gallery.',
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-brand-cream/50 transition-colors"
      >
        <span className="font-semibold text-brand-navy pr-4">{q}</span>
        <HiChevronDown
          className={`text-brand-gold text-xl flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-4 text-gray-600 leading-relaxed animate-fade-in">{a}</div>
      )}
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const location = useLocation();
  const [formStatus, setFormStatus] = useState('');

  useEffect(() => {
    if (location.hash) {
      const timer = setTimeout(() => {
        document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.hash]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sent');
    e.target.reset();
    setTimeout(() => setFormStatus(''), 4000);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-midnight via-brand-navy-dark to-brand-navy overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-gold rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-gold-soft rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left animate-fade-up">
              <span className="inline-flex items-center bg-brand-gold/20 border border-brand-gold/30 rounded-full px-4 py-1.5 text-brand-gold-champagne text-sm mb-6">
                <span className="w-2 h-2 bg-brand-gold rounded-full mr-2 animate-pulse" />
                Premium Bakery · Nairobi, Kenya
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                Where Every Bite Tells a{' '}
                <span className="text-brand-gold">Sweet Story</span>
              </h1>
              <p className="script-highlight text-white/90 mb-2">Home of Sweetness</p>
              <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-xl leading-relaxed mx-auto lg:mx-0">
                Premium cakes, artisan bakery products, and custom creations crafted with love,
                quality, and celebration in every detail.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold text-lg px-8 py-4 inline-flex items-center justify-center gap-2"
                >
                  <FaWhatsapp className="text-xl" />
                  Order on WhatsApp
                </a>
                <a
                  href="#featured-cakes"
                  className="bg-white/10 text-white border-2 border-white/20 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/20 transition-all inline-flex items-center justify-center gap-2"
                >
                  View Our Cakes
                  <HiArrowRight />
                </a>
              </div>
            </div>
            <div className="flex justify-center animate-fade-up">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-gold/20 rounded-full blur-2xl scale-110" />
                <img
                  src="/logo.jpg"
                  alt="Mwiti Bakers"
                  className="relative w-64 h-64 md:w-80 md:h-80 rounded-full object-cover shadow-2xl border-4 border-brand-gold/30 animate-float"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-brand-cream to-transparent" />
      </section>

      {/* About */}
      <section id="about" className="py-20 md:py-28 bg-brand-cream scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="section-badge">About Mwiti Bakers</span>
              <h2 className="section-title">Crafted with Passion, Baked with Love</h2>
              <div className="gold-divider !mx-0 mb-6" />
              <p className="text-gray-600 leading-relaxed mb-5">
                Mwiti Bakers is Nairobi&apos;s premium bakery destination — where quality meets
                celebration. Born from a deep passion for the art of baking, we create unforgettable
                experiences through expertly crafted cakes, pastries, and custom orders.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                Every creation reflects our commitment to craftsmanship, trust, and the sweet
                moments that bring people together. From intimate birthdays to grand weddings, we
                are your partner in celebration.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '500+', label: 'Cakes Delivered' },
                  { value: '100%', label: 'Fresh Daily' },
                  { value: '5★', label: 'Customer Rated' },
                  { value: '10+', label: 'Years Experience' },
                ].map(({ value, label }) => (
                  <div key={label} className="card p-4 text-center">
                    <div className="text-2xl font-bold text-brand-navy">{value}</div>
                    <div className="text-sm text-gray-500">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=700&h=500&fit=crop"
                alt="Baker crafting a cake"
                className="rounded-2xl shadow-card-hover w-full object-cover h-80 lg:h-[420px]"
                loading="lazy"
              />
              <div className="absolute -bottom-6 -left-6 bg-brand-navy text-white p-6 rounded-2xl shadow-xl max-w-xs hidden sm:block">
                <p className="font-script text-brand-gold text-xl mb-1">Our Promise</p>
                <p className="text-sm text-gray-300">
                  Quality ingredients, expert craftsmanship, and sweetness in every bite.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cakes */}
      <section id="featured-cakes" className="py-20 md:py-28 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-badge">Our Signature Collection</span>
            <h2 className="section-title">Featured Cakes</h2>
            <p className="section-subtitle">
              Handcrafted masterpieces for every celebration
            </p>
            <div className="gold-divider mt-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_CAKES.map((cake) => (
              <div key={cake.name} className="card-premium group">
                <div className="relative overflow-hidden h-48">
                  <img
                    src={cake.image}
                    alt={cake.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-midnight/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-brand-navy mb-1">{cake.name}</h3>
                  <p className="text-gray-500 text-sm mb-3">{cake.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-brand-gold font-semibold text-sm">{cake.price}</span>
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-navy text-sm font-semibold hover:text-brand-gold transition-colors inline-flex items-center gap-1"
                    >
                      Order <HiArrowRight className="text-xs" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bakery Products */}
      <section id="products" className="py-20 md:py-28 bg-brand-gray scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-badge">Fresh Daily</span>
            <h2 className="section-title">Bakery Products</h2>
            <p className="section-subtitle">
              A full range of premium baked goods for every craving
            </p>
            <div className="gold-divider mt-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BAKERY_PRODUCTS.map((product) => (
              <div key={product.name} className="card-premium p-6 flex items-start gap-4">
                <span className="text-4xl">{product.emoji}</span>
                <div>
                  <h3 className="font-bold text-brand-navy mb-1">{product.name}</h3>
                  <p className="text-gray-500 text-sm">{product.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Orders */}
      <section id="custom-orders" className="py-20 md:py-28 bg-brand-navy scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-brand-gold font-semibold text-sm uppercase tracking-widest">
                Bespoke Creations
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mt-3 mb-4">
                Custom Cake Orders
              </h2>
              <p className="font-script text-brand-gold text-2xl mb-6">
                Your vision, our artistry
              </p>
              <p className="text-gray-300 leading-relaxed mb-6">
                From wedding masterpieces to themed birthday showstoppers — tell us your dream
                and we&apos;ll bring it to life. Every custom order is a unique work of edible art.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Wedding & anniversary cakes',
                  'Themed birthday designs',
                  'Corporate event cakes',
                  'Baby shower & gender reveal',
                  'Any flavor, any size, any style',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-200">
                    <HiCheckCircle className="text-brand-gold text-xl flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold text-lg px-8 py-4 inline-flex items-center gap-2"
              >
                <FaWhatsapp className="text-xl" />
                Start Your Custom Order
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {GALLERY_IMAGES.slice(0, 4).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Custom cake ${i + 1}`}
                  className={`rounded-2xl object-cover w-full shadow-lg ${i % 2 === 0 ? 'h-44' : 'h-52 mt-6'}`}
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-us" className="py-20 md:py-28 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-badge">The Mwiti Difference</span>
            <h2 className="section-title">Why Choose Us</h2>
            <p className="section-subtitle">
              Trust, quality, and celebration in everything we bake
            </p>
            <div className="gold-divider mt-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_CHOOSE_US.map(({ title, description, icon }) => (
              <div key={title} className="card-premium p-7 text-center">
                <span className="text-4xl mb-4 block">{icon}</span>
                <h3 className="font-bold text-brand-navy text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-badge">Happy Customers</span>
            <h2 className="section-title">What Our Clients Say</h2>
            <p className="script-highlight mt-2">Sweet words from sweet people</p>
            <div className="gold-divider mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, text, rating }) => (
              <div key={name} className="card p-7">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <HiStar key={i} className="text-brand-gold text-lg" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-5 italic">&ldquo;{text}&rdquo;</p>
                <p className="font-semibold text-brand-navy">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-20 md:py-28 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-badge">Visual Feast</span>
            <h2 className="section-title">Cake Gallery</h2>
            <p className="section-subtitle">A glimpse into our world of sweetness</p>
            <div className="gold-divider mt-4" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {GALLERY_IMAGES.map((img, i) => (
              <div key={i} className="relative overflow-hidden rounded-2xl group aspect-square">
                <img
                  src={img}
                  alt={`Gallery ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-brand-navy/0 group-hover:bg-brand-navy/30 transition-colors duration-300" />
              </div>
            ))}
          </div>
          {user ? (
            <div className="text-center mt-10">
              <Link to="/gallery" className="btn-primary inline-flex items-center gap-2">
                View Full Gallery <HiArrowRight />
              </Link>
            </div>
          ) : (
            <div className="text-center mt-10">
              <p className="text-gray-500 mb-4">Sign up to access our exclusive premium image gallery</p>
              <Link to="/signup" className="btn-outline inline-flex items-center gap-2">
                Create Free Account <HiArrowRight />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-28 bg-brand-gray scroll-mt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-badge">Got Questions?</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <div className="gold-divider mt-4" />
          </div>
          <div className="space-y-3">
            {FAQS.map(({ q, a }) => (
              <FAQItem key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 md:py-28 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-badge">Reach Out</span>
            <h2 className="section-title">Get In Touch</h2>
            <p className="section-subtitle">
              We&apos;d love to hear from you — order, inquire, or celebrate with us
            </p>
            <div className="gold-divider mt-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <div className="space-y-4 mb-8">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp w-full text-lg py-4"
                >
                  <FaWhatsapp className="text-2xl" />
                  WhatsApp: {CONTACT.phone}
                </a>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-brand-gold hover:shadow-gold transition-all group"
                >
                  <div className="w-12 h-12 bg-brand-cream rounded-xl flex items-center justify-center group-hover:bg-brand-gold/20 transition-colors">
                    <HiMail className="text-brand-navy text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold text-brand-navy">{CONTACT.email}</p>
                  </div>
                </a>
                <a
                  href={CONTACT.websiteUrl}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-brand-gold hover:shadow-gold transition-all group"
                >
                  <div className="w-12 h-12 bg-brand-cream rounded-xl flex items-center justify-center group-hover:bg-brand-gold/20 transition-colors">
                    <HiGlobeAlt className="text-brand-navy text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <p className="font-semibold text-brand-navy">{CONTACT.website}</p>
                  </div>
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-3 font-semibold uppercase tracking-wider">
                  Follow Us
                </p>
                <SocialIconsLight size="md" />
              </div>
            </div>

            {/* Contact Form */}
            <div className="card p-8">
              <h3 className="text-xl font-bold text-brand-navy mb-6">Send Us a Message</h3>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <input type="text" placeholder="Your Name" required className="input-field" />
                <input type="email" placeholder="Your Email" required className="input-field" />
                <input type="tel" placeholder="Your Phone (optional)" className="input-field" />
                <textarea
                  rows="4"
                  placeholder="Tell us about your order or inquiry..."
                  required
                  className="input-field resize-none"
                />
                <button type="submit" className="btn-primary w-full">
                  Send Message
                </button>
                {formStatus === 'sent' && (
                  <p className="text-green-600 text-sm text-center animate-fade-in">
                    Thank you! We&apos;ll get back to you soon.
                  </p>
                )}
              </form>
              <p className="text-gray-400 text-xs text-center mt-4">
                For fastest response, order directly via{' '}
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">
                  WhatsApp
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-brand-midnight to-brand-navy">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img
            src="/logo.jpg"
            alt="Mwiti Bakers"
            className="w-20 h-20 rounded-full mx-auto mb-6 shadow-gold border-2 border-brand-gold/40"
          />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Celebrate?
          </h2>
          <p className="font-script text-brand-gold text-2xl mb-2">Home of Sweetness</p>
          <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
            Order your dream cake today and let Mwiti Bakers make your celebration unforgettable.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold text-lg px-10 py-4 inline-flex items-center gap-2"
          >
            <FaWhatsapp className="text-xl" />
            Order on WhatsApp Now
          </a>
        </div>
      </section>
    </div>
  );
}
