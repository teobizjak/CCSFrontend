import React from 'react';
import { FaCrown, FaShieldAlt, FaChessBoard } from 'react-icons/fa';

const DiscoverSolanaChess = () => {
  return (
    <div className="bg-gray-800 py-12 px-4 cursor-default">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-purple-600 mb-6">Discover Solana Chess: Where Strategy Rewards</h2>
        <p className="mb-10 text-gray-300">Immerse yourself in Solana Chess, where every strategic move brings you closer to tangible rewards, all within the secure confines of our dark-themed universe.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col items-center bg-gray-900 rounded-lg shadow hover:bg-gray-950 p-8 transition-colors duration-300 ease-in-out">
            <FaChessBoard className="text-gray-100 text-5xl mb-5" />
            <h3 className="font-semibold mb-3 text-purple-400">Earn as You Play</h3>
            <p className="text-gray-300">Victory transcends glory; it's about earning SOL in every win.</p>
          </div>

          <div className="flex flex-col items-center bg-gray-900 rounded-lg shadow hover:bg-gray-950 p-8 transition-colors duration-300 ease-in-out">
            <FaShieldAlt className="text-indigo-600 text-5xl mb-5" />
            <h3 className="font-semibold mb-3 text-purple-400">Secure & Transparent</h3>
            <p className="text-gray-300">Our games are powered by the Solana blockchain, ensuring unmatched security and transparency.</p>
          </div>

          <div className="flex flex-col items-center bg-gray-900 rounded-lg shadow hover:bg-gray-950 p-8 transition-colors duration-300 ease-in-out">
            <FaCrown className=" text-amber-400 text-5xl mb-5" />
            <h3 className="font-semibold mb-3 text-purple-400">Leaderboards & Rewards</h3>
            <p className="text-gray-300">Rise through the ranks in our global community and reap incredible rewards every season.</p>
          </div>

          <div className="flex flex-col items-center bg-gray-900 rounded-lg shadow hover:bg-gray-950 p-8 transition-colors duration-300 ease-in-out">
            <FaShieldAlt className="text-indigo-600 text-5xl mb-5 rotate-180" />
            <h3 className="font-semibold mb-3 text-purple-400">Fair Play Guaranteed</h3>
            <p className="text-gray-300">Our advanced anti-cheat systems and review processes ensure a fair competition for all.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoverSolanaChess;
