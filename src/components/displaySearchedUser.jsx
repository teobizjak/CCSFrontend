import React from 'react';
import { useNavigate } from 'react-router-dom';

const DisplaySearchedUserComponent = ({ user, style }) => {
  const navigate = useNavigate();

  function navigateToProfile(addr) {
    navigate(`/profile/${addr}`);
  }

  // Construct user's name or provide a fallback
  const userName = user.firstName || user.lastName
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : `${user.walletAddress.slice(0, 6)}...`;

  return (
    <div
      style={style}
      className="cursor-pointer mt-4 bg-slate-800 p-5 rounded-xl shadow-xl transition-all duration-500 ease-in-out hover:shadow-2xl hover:bg-slate-700 animate-fadeIn"
      onClick={() => navigateToProfile(user.walletAddress)}
    >
      <div className="flex flex-col md:flex-row justify-between items-center">
        <h3 className={`text-lg md:text-xl font-semibold text-white ${!user.firstName && !user.lastName ? 'mb-2 md:mb-0' : ''}`}>
          {userName || 'Unknown User'}
        </h3>
        <span className="bg-purple-600 text-white text-sm md:text-md font-medium px-3 py-1 rounded-full">ELO: {user.elo || 'N/A'}</span>
      </div>
      <p className="text-gray-400 mt-2">
        <i className="fas fa-wallet mr-2"></i> {/* Ensure you have FontAwesome or another icon library integrated */}
        <span className="font-medium text-indigo-400">Address:</span> {user.walletAddress.slice(0, 12)}...
      </p>
    </div>
  );
};

export default DisplaySearchedUserComponent;
