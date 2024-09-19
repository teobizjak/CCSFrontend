import React, { useState } from 'react';

function ClaimHistory({ data }) {
  const [openClaims, setOpenClaims] = useState({});

  // Toggle function to open/close specific claims
  const toggleClaim = (index) => {
    setOpenClaims((prevState) => ({
      ...prevState,
      [index]: !prevState[index], // Toggle the clicked index
    }));
  };

  // Helper function to shorten wallet addresses and txnIds
  const shortenString = (str) => {
    if (!str) return '';
    return str.length > 6 ? `${str.substring(0, 6)}...` : str;
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-center text-white">Claim History</h2>
      {data && data.length > 0 ? (
        data.map((claim, index) => (
          <div
            key={index}
            className="bg-gray-800 border border-gray-700 p-4 mb-4 rounded-lg shadow-lg"
          >
            <div
              className="flex justify-between items-center cursor-pointer text-white"
              onClick={() => toggleClaim(index)}
            >
              <div className="text-lg font-semibold">
                Initiator: <span className="text-purple-500">{shortenString(claim.initiator)}</span>
              </div>
              <div className="text-lg font-semibold">
                Total Amount: <span className="text-purple-500">{claim.totalAmount} SOL</span>
              </div>
              <button className="text-sm text-gray-400 hover:text-gray-200 focus:outline-none">
                {openClaims[index] ? 'Hide' : 'Show'} Details
              </button>
            </div>

            {/* Conditionally render the shares if the claim is open */}
            {openClaims[index] && (
              <div className="mt-4 border-t border-gray-700 pt-4">
                <h4 className="text-lg font-semibold mb-2 text-white">Shares</h4>
                {claim.shares && claim.shares.length > 0 ? (
                  <ul className="space-y-3">
                    {claim.shares.map((share, shareIndex) => (
                      <li
                        key={shareIndex}
                        className="bg-gray-700 p-3 rounded-lg flex justify-between items-center text-white"
                      >
                        <div>
                          <span className="font-medium text-purple-400">Wallet:</span> {shortenString(share.walletAddress)}
                        </div>
                        <div>
                          <span className="font-medium text-purple-400">Amount:</span> {share.amount} SOL
                        </div>
                        <div>
                          <span className="font-medium text-purple-400">TxnID:</span> {shortenString(share.txnId)}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">No shares available for this claim.</p>
                )}
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-center text-gray-400">No claims available.</p>
      )}
    </div>
  );
}

export default ClaimHistory;
