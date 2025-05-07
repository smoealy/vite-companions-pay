
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-cp-neutral-200 py-6 px-4 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo and Tagline */}
          <div className="flex flex-col items-center md:items-start">
            <Logo size={36} className="mb-2" />
            <p className="text-sm text-cp-neutral-600 max-w-xs text-center md:text-left">
              Your Shariah-compliant companion for the journey to Umrah and beyond
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-cp-green-700 mb-2">Quick Links</h3>
            <div className="flex flex-col md:flex-row gap-3 md:gap-6">
              <Link to="/dashboard" className="text-sm text-cp-neutral-600 hover:text-cp-green-600 transition-colors">
                Dashboard
              </Link>
              <Link to="/redeem" className="text-sm text-cp-neutral-600 hover:text-cp-green-600 transition-colors">
                Redeem Umrah
              </Link>
              <Link to="/ai-assistant" className="text-sm text-cp-neutral-600 hover:text-cp-green-600 transition-colors">
                AI Assistant
              </Link>
            </div>
          </div>
          
          {/* Legal Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-cp-green-700 mb-2">Legal</h3>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-cp-neutral-600 hover:text-cp-green-600 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-cp-neutral-600 hover:text-cp-green-600 transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
          
          {/* Social Media */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-cp-green-700 mb-2">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" aria-label="Telegram" className="text-cp-neutral-600 hover:text-cp-green-600 transition-colors">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-16.5 7.5a2.25 2.25 0 0 0 .126 4.303l3.984 1.329 2.25 6.75a2.25 2.25 0 0 0 4.135.756l10.166-13.595A2.25 2.25 0 0 0 21.198 2.433Z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="text-cp-neutral-600 hover:text-cp-green-600 transition-colors">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-cp-neutral-200 text-center">
          <p className="text-xs text-cp-neutral-500">
            © {new Date().getFullYear()} Companions Pay. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
