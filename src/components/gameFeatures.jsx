import React from 'react';
import { FaUserCircle, FaSearchDollar, FaRegEye, FaRegListAlt, FaCodeBranch, FaUsers } from 'react-icons/fa';

const GameFeatures = () => {
    // Tailwind CSS classes for feature items
    const featureItemClasses = "flex flex-col items-center p-6 bg-gray-900 rounded-lg shadow hover:bg-gray-950 transform hover:-translate-y-1 transition-all duration-300";

    return (
        <div className="bg-gray-800 text-white py-12 px-4 cursor-default">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-purple-600 mb-6">Exciting Game Features</h2>
                    <p className="text-gray-300 mb-10">Explore the unique features that elevate your chess experience on Solana Chess.</p>
                </div>

                {/* Grid container with items aligned to start for the last row */}
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center justify-items-start mb-8">
                    <li className={featureItemClasses}>
                        <FaUserCircle className="text-teal-400 text-5xl mb-4" />
                        <h3 className="text-xl font-semibold text-purple-400 mb-2">Profile Customization</h3>
                        <p className="text-gray-300">Tailor your profile with custom names and avatars that reflect your gaming persona.</p>
                    </li>

                    <li className={featureItemClasses}>
                        <FaSearchDollar className="text-red-400 text-5xl mb-4" />
                        <h3 className="text-xl font-semibold text-purple-400 mb-2">Low-Fee Transactions</h3>
                        <p className="text-gray-300">Enjoy the perks of low gas fees with SOL, making transactions quick and efficient.</p>
                    </li>

                    <li className={featureItemClasses}>
                        <FaRegEye className="text-blue-400 text-5xl mb-4" />
                        <h3 className="text-xl font-semibold text-purple-400 mb-2">Live Game Watching</h3>
                        <p className="text-gray-300">Watch live matches and pick up strategies from top players in real-time.</p>
                    </li>

                    <li className={featureItemClasses}>
                        <FaRegListAlt className="text-amber-400 text-5xl mb-4" />
                        <h3 className="text-xl font-semibold text-purple-400 mb-2">Transparent Rewards</h3>
                        <p className="text-gray-300">Verify winnings with Solana transaction IDs for complete transparency.</p>
                    </li>

                    <li className={featureItemClasses}>
                        <FaCodeBranch className="text-green-400 text-5xl mb-4" />
                        <h3 className="text-xl font-semibold text-purple-400 mb-2">Engine Game Review</h3>
                        <p className="text-gray-300">Leverage post-game analysis tools to review and improve your gameplay.</p>
                    </li>
                    <li className={featureItemClasses}>
                        <FaUsers className="text-orange-400 text-5xl mb-4" />
                        <h3 className="text-xl font-semibold text-purple-400 mb-2">Community Hub</h3>
                        <p className="text-gray-300">Join the community forum, share insights, and connect with players worldwide.</p>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default GameFeatures;
