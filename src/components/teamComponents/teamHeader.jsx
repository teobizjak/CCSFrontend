import React, { useEffect, useState } from 'react';
import axios from 'axios';

const roleMap = {
  0: 'Validator',
  1: 'Member',
  2: 'Admin',
  3: 'Owner',
};

function TeamHeader({ token }) {
    axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION
  const [userData, setUserData] = useState({ username: '',roleNum: 0, role: '', share: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/teamData', {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        });
        
        if (response.data.valid) {
          const { user } = response.data;
          setUserData({
            username: user.username,
            role: roleMap[user.role] || 'Unknown',
            roleNum: user.role,
            share: user.share
          });
        } else {
          setUserData({
            username: 'Unknown',
            role: 'Unknown'
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData({
          username: 'Unknown',
          role: 'Unknown'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  if (loading) {
    return <div>Loading...</div>; // Add a spinner or other loading indicator here
  }

  return (
    <nav className="w-full p-6 grid grid-cols-3 items-center bg-gray-900">
      <div className=""></div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-purple-500">Team Panel</h1>
      </div>
      <div className="text-right pr-4">
        <div className="text-white">
          <span className="font-medium">{userData.username}</span>
          <span className="text-gray-400 ml-2">({userData.role}{userData.share && (" - " + userData.share + "%")})</span>
        </div>
      </div>
    </nav>
  );
}

export default TeamHeader;
