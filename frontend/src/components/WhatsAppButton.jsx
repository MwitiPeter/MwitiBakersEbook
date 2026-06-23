import { FaWhatsapp } from 'react-icons/fa';
import { WHATSAPP_URL } from '../constants/brand';

export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Order on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2
        bg-[#25D366] text-white pl-4 pr-5 py-3.5 rounded-full
        shadow-lg hover:shadow-xl hover:scale-105
        transition-all duration-300 group"
    >
      <FaWhatsapp className="text-2xl group-hover:animate-pulse" />
      <span className="font-semibold text-sm hidden sm:inline">Order on WhatsApp</span>
    </a>
  );
}
