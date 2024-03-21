import React from 'react';
import { FaInstagram, FaTiktok, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-6">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
        <div className="mb-4 md:mb-0">
          <p>&copy; {new Date().getFullYear()} Crypto Chess Solana. All rights reserved.</p>
          <a href="/privacy-policy" className="text-gray-300 hover:text-purple-400 transition-colors duration-300">Privacy Policy</a>
        </div>

        <div className="mb-4 md:mb-0">
          <p>Email us for support: <a href="mailto:support@cryptochess.site" className="text-gray-300 hover:text-purple-400 transition-colors duration-300">support@cryptochess.site</a></p>
        </div>

        <div className="flex gap-4">
          <a href="https://www.instagram.com/cryptochess.site" target="_blank" rel="noopener noreferrer" className="text-white hover:text-purple-400 transition-colors duration-300">
            <FaInstagram className="text-2xl" />
          </a>
          <a href="https://www.tiktok.com/@cryptochess.site" target="_blank" rel="noopener noreferrer" className="text-white hover:text-purple-400 transition-colors duration-300">
            <FaTiktok className="text-2xl" />
          </a>
          <a href="https://twitter.com/cryptochess_site" target="_blank" rel="noopener noreferrer" className="text-white hover:text-purple-400 transition-colors duration-300">
            <FaTwitter className="text-2xl" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
