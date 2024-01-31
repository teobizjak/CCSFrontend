import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Heading from './heading';

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('tab1');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const category = activeTab === 'tab1' ? 'elo' : activeTab === 'tab2' ? 'won' : 'winnings';
    axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION;

    axios.get('/getLeaderboard', { params: { category } })
      .then(response => {
        setLeaderboardData(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the leaderboard data:', error);
      });
  }, [activeTab]);

  const TabButton = ({ label, tab }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-grow px-4 py-2 text-sm font-medium rounded-md transition duration-300 ease-in-out ${
        activeTab === tab ? 'text-gray-900 bg-purple-300' : 'text-gray-300 bg-gray-700 hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );

  const navigateToProfile = (walletAddress) => {
    // Your navigation logic here
    navigate(`/profile/${walletAddress}`);
  };

  const renderPlayerIdentity = (item) => {
    const displayText = item.firstName && item.lastName ? `${item.firstName} ${item.lastName}` : `${item.walletAddress.slice(0,8)}...`;
    return (
      <span
        className="hover:text-purple-400 cursor-pointer"
        onClick={() => navigateToProfile(item.walletAddress)}
      >
        {displayText}
      </span>
    );
  };

  const renderDataBasedOnTab = (item) => {
    switch (activeTab) {
      case 'tab1': // Elo
        return <>{renderPlayerIdentity(item)} - {item.elo}</>;
      case 'tab2': // Wins
        return <>{renderPlayerIdentity(item)} - {item.won}</>;
      case 'tab3': // Winnings
        return <>{renderPlayerIdentity(item)} - {item.winnings} SOL</>;
      default:
        return '';
    }
  };

  return (
    <>
    
    <div className="container mx-auto p-4">
    <Heading>Leaderboard</Heading>
      <div className="flex w-full space-x-2 mb-4">
        <TabButton label="Elo" tab="tab1" />
        <TabButton label="Wins" tab="tab2" />
        <TabButton label="Winnings" tab="tab3" />
      </div>

      <div className="bg-gray-800 shadow rounded-lg p-4 text-white">
        <ul>
          {leaderboardData.map((item, index) => (
            <li key={index} className={`py-2 border-b border-gray-700 ${index === 0 ? 'font-bold' : ''}`}>
              {index + 1}. {renderDataBasedOnTab(item)}
            </li>
          ))}
        </ul>
      </div>
    </div>
    </>
  );
};

export default Leaderboard;
