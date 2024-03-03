import React from 'react';
import { FaChessKnight, FaFlagCheckered, FaChartLine, FaMobileAlt, FaBrain, FaGem } from 'react-icons/fa';

const RoadmapToVictory = () => {
  // Tailwind CSS classes for feature items
  const featureItemClasses = "flex flex-col items-center p-6 bg-gray-800 rounded-lg shadow hover:bg-gray-700 transform hover:-translate-y-1 transition-all duration-300";

  return (
    <div className="bg-gray-900 text-white py-12 px-4 cursor-default">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-purple-600 mb-6">Roadmap to Victory</h2>
          <p className="text-gray-300 mb-10">Your strategic journey through Solana Chess is filled with achievements and exclusive rewards.</p>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center mb-8">
          <li className={featureItemClasses}>
            <FaChessKnight className="text-cyan-400 text-5xl mb-4" />
            <h3 className="text-xl font-semibold text-purple-400 mb-2">Start Competing</h3>
            <p className="text-gray-300">Begin your journey and start competing in matches to increase your ELO.</p>
          </li>

          <li className={featureItemClasses}>
            <FaFlagCheckered className="text-green-400 text-5xl mb-4" />
            <h3 className="text-xl font-semibold text-purple-400 mb-2">Milestone Achievements</h3>
            <p className="text-gray-300">Hit gameplay milestones to unlock new bet levels and profile perks.</p>
          </li>

          <li className={featureItemClasses}>
            <FaChartLine className="text-blue-400 text-5xl mb-4" />
            <h3 className="text-xl font-semibold text-purple-400 mb-2">Climb the Ranks</h3>
            <p className="text-gray-300">Improve your ELO and compete for a spot on the leaderboard each season.</p>
          </li>

          <li className={featureItemClasses}>
            <FaMobileAlt className="text-yellow-400 text-5xl mb-4" />
            <h3 className="text-xl font-semibold text-purple-400 mb-2">Mobile App Coming Soon</h3>
            <p className="text-gray-300">Stay tuned for the launch of our mobile app for playing on the go.</p>
          </li>

          <li className={featureItemClasses}>
            <FaBrain className="text-red-400 text-5xl mb-4" />
            <h3 className="text-xl font-semibold text-purple-400 mb-2">Advanced Engine Analysis</h3>
            <p className="text-gray-300">Look forward to enhanced game analysis features to refine your strategy.</p>
          </li>

          <li className={featureItemClasses}>
            <FaGem className="text-pink-400 text-5xl mb-4" />
            <h3 className="text-xl font-semibold text-purple-400 mb-2">NFT Sets Coming Soon</h3>
            <p className="text-gray-300">Customize your game with unique NFT chess pieces in the future.</p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RoadmapToVictory;
