import React, { useState } from 'react';
import axios from 'axios';
import { useWallet } from '@solana/wallet-adapter-react';

function ClaimSection({ claimAmount }) {
    const { publicKey } = useWallet()
  const [safeClaim, setSafeClaim] = useState(true);
  const [loading, setLoading] = useState(false); // For button loading state

  // Toggle safeClaim between true (Safe) and false (Fast)
  const handleToggle = () => {
    setSafeClaim(!safeClaim);
  };

  // Handle claim button click
  const handleClaim = async () => {
    try {
      setLoading(true); // Start loading

      // Adjust claim amount based on the safeClaim toggle
      const adjustedAmount = safeClaim ? claimAmount * 0.95 : claimAmount;

      const response = await axios.post('/claimProfits', {
        initiator: publicKey.toBase58(),
        safeClaim,
      });
      console.log('Claim response:', response.data); // Handle response
    } catch (error) {
      console.error('Error claiming:', error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg max-w-md mx-auto text-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Claim Section</h2>

      <div className="mb-6 text-center">
        <p className="text-lg">
          Claim Amount: <span className="text-purple-500">{safeClaim ? (claimAmount * 0.95).toFixed(2) : claimAmount} SOL</span>
        </p>
        <p className="mt-2 text-sm text-gray-400">
          Mode: <span className="font-semibold">{safeClaim ? 'Safe Claim (95%)' : 'Full Claim (100%)'}</span>
        </p>
      </div>

      {/* Toggle switch for Safe/Fast Claim */}
      <div className="flex justify-center items-center mb-6">
        <span className="mr-2 text-gray-400">Full</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only"
            checked={safeClaim}
            onChange={handleToggle}
          />
          <div
            className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-purple-300 
            dark:peer-focus:ring-purple-800 transition-all"
          >
            <div
              className={`h-5 w-5 rounded-full transition-all ${
                safeClaim ? 'translate-x-6 bg-purple-500' : 'translate-x-0 bg-gray-300'
              }`}
            />
          </div>
        </label>
        <span className="ml-2 text-gray-400">Safe</span>
      </div>

      {/* Claim button */}
      <div className="flex justify-center">
        <button
          className={`px-6 py-3 font-semibold text-white rounded-lg focus:outline-none transition-all 
          ${loading ? 'bg-gray-700 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-400'}`}
          onClick={handleClaim}
          disabled={loading} // Disable button while loading
        >
          {loading ? 'Processing...' : 'Claim'}
        </button>
      </div>
    </div>
  );
}

export default ClaimSection;
