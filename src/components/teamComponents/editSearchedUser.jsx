import React, { useState } from 'react';
import axios from 'axios';

const UserProfileEdit = ({ user, token }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    picture: user.picture || '',
    title: user.title || '',
    siteTitle: user.siteTitle || '',
    elo: user.elo || 800,
    eloK: user.eloK || 200,
    reported: user.reported || 0,
    banned: user.banned || false,
    verified: user.verified || false,
    verifyElo: user.verifyElo || 1000,
    featured: user.featured || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = { ...formData, walletAddress: user.walletAddress }; // Add walletAddress here
    try {
      const response = await axios.post('userUpdateTeam', dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data); // Handle the response as needed
    } catch (error) {
      console.error(error); // Handle the error as needed
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 my-4 p-4 bg-white rounded shadow-lg">
        <h1 className='text-center'>Account: {user.walletAddress}</h1>
      {Object.entries(formData).map(([key, value]) => (
        <div key={key} className="flex flex-col">
          <label htmlFor={key} className="mb-2 text-sm font-medium text-gray-900">{key}:</label>
          {typeof value === 'boolean' ? (
            <input
              id={key}
              name={key}
              type="checkbox"
              checked={value}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          ) : (
            <input
              id={key}
              name={key}
              type={typeof value === 'number' ? 'number' : 'text'}
              value={value}
              onChange={handleChange}
              disabled={['walletAddress', 'paid', 'winnings', 'won', 'lost', 'drawn'].includes(key)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          )}
        </div>
      ))}

      <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        Save
      </button>
    </form>
  );
};

export default UserProfileEdit;
