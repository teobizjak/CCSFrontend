import React from 'react';
import { FaInstagram, FaTiktok, FaTwitter } from 'react-icons/fa';

const LearnMore = () => {
  return (
    <div className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-7xl min-h-screen mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-purple-600 mb-8">Learn More About Crypto Chess</h1>
          <p className="text-gray-300 mb-10">
            Follow us on social media to stay updated with the latest news, tips, and community highlights from Solana Chess.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Instagram Card */}
          <a href="https://www.instagram.com/cryptochess.site" target="_blank" rel="noopener noreferrer" className="social-card">
            <div className="flex flex-col items-center p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-all duration-300">
              <FaInstagram className="text-pink-400 text-6xl mb-4" />
              <h2 className="text-3xl font-semibold mb-2">@cryptochess.site</h2>
              <p className="text-gray-300 text-lg text-center">Follow us on Instagram for exclusive content and behind-the-scenes looks.</p>
            </div>
          </a>

          {/* TikTok Card */}
          <a href="https://www.tiktok.com/@my_username" target="_blank" rel="noopener noreferrer" className="social-card">
            <div className="flex flex-col items-center p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-all duration-300">
              <FaTiktok className="text-black text-6xl mb-4" />
              <h2 className="text-3xl font-semibold mb-2">@my_username</h2>
              <p className="text-gray-300 text-lg text-center">Catch the latest trends and fun moments on our TikTok channel.</p>
            </div>
          </a>

          {/* Twitter Card */}
          <a href="https://twitter.com/my_username" target="_blank" rel="noopener noreferrer" className="social-card">
            <div className="flex flex-col items-center p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-all duration-300">
              <FaTwitter className="text-sky-400 text-6xl mb-4" />
              <h2 className="text-3xl font-semibold mb-2">@my_username</h2>
              <p className="text-gray-300 text-lg text-center">Follow us on Twitter for the latest updates and conversations.</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default LearnMore;
