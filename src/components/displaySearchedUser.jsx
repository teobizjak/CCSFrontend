import React from 'react';
import { FaWallet } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const DisplaySearchedUserComponent = ({ user, style }) => {
  const navigate = useNavigate();

  function navigateToProfile(addr) {
    navigate(`/profile/${addr}`);
  }

  const userName = user.firstName || user.lastName
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : `${user.walletAddress.slice(0, 6)}...`;

  return (
    <div
      style={style}
      className="cursor-pointer mt-2 sm:mt-4 bg-slate-800 p-2 sm:p-4 rounded-lg shadow transition-all duration-500 ease-in-out hover:shadow-2xl hover:bg-slate-700 animate-fadeIn"
      onClick={() => navigateToProfile(user.walletAddress)}
    >
      <div className="flex flex-row justify-between items-center">
        <h3 className="text-sm sm:text-lg font-semibold text-white truncate" style={{ maxWidth: '150px' }}>
          {userName || 'Unknown User'}
        </h3>
        <span className="mt-1 sm:mt-0 bg-purple-500 text-white text-xs sm:text-sm font-medium px-2 py-1 rounded-full whitespace-nowrap">
          ELO: {user.elo || 'N/A'}
        </span>
      </div>

      <p className="text-gray-300 mt-2 text-xs sm:text-sm flex items-center">
        <FaWallet className='mr-1'/>
        <span className="font-medium text-indigo-300">Address:</span> {user.walletAddress.slice(0, 12)}...
      </p>
    </div>
  );
};

export default DisplaySearchedUserComponent;
