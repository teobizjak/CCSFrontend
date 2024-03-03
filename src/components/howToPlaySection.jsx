import React from 'react';
import { FaWallet, FaHandHoldingUsd, FaTrophy } from 'react-icons/fa';

const HowToPlayAndWin = () => {
  return (
    <div className="bg-gray-900 text-white py-12 px-4 cursor-default">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-purple-600 mb-6">How to Play & Win</h2>
        <p className="mb-10 text-gray-300">Connect your wallet, place your bet, and outsmart your opponents in Solana Chess. Victory is a strategic move away:</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center bg-gray-800 p-8 rounded-xl shadow-lg hover:bg-gray-700 transition-all duration-300 ease-in-out">
            <FaWallet className="text-green-400 text-5xl mb-5" />
            <h3 className="font-semibold mb-3 text-purple-400">Connect Wallet</h3>
            <p className="text-gray-300">Access the game securely by connecting your crypto wallet, eliminating the need for passwords.</p>
          </div>

          <div className="flex flex-col items-center bg-gray-800 p-8 rounded-xl shadow-lg hover:bg-gray-700 transition-all duration-300 ease-in-out">
            <FaHandHoldingUsd className="text-blue-400 text-5xl mb-5" />
            <h3 className="font-semibold mb-3 text-purple-400">Choose Your Bet</h3>
            <p className="text-gray-300">Decide the stakes. Select the amount of SOL you want to wager in the next match.</p>
          </div>

          <div className="flex flex-col items-center bg-gray-800 p-8 rounded-xl shadow-lg hover:bg-gray-700 transition-all duration-300 ease-in-out">
            <FaTrophy className="text-yellow-400 text-5xl mb-5" />
            <h3 className="font-semibold mb-3 text-purple-400">Claim Your Victory</h3>
            <p className="text-gray-300">Checkmate your opponent and earn 195% of your bet. Your winnings are direct to your wallet.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToPlayAndWin;
