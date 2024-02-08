import React from 'react';
import { FaTimes } from 'react-icons/fa';

const AuthorizationModal = ({closeModal}) => {
  return (
    <div className='fixed inset-0 z-50 bg-gray-900 bg-opacity-80 flex justify-center items-center'>
      <div className="relative bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">User Authorization Required</h2>
          <button onClick={closeModal} className="text-white text-lg p-1">
            <FaTimes/>
          </button>
        </div>
        <div className="mt-4">
          <p>To enhance security and ensure a seamless user experience, we require authorization through Solana's advanced signing mechanism. Please sign the authorization message to receive your unique user token.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthorizationModal;
