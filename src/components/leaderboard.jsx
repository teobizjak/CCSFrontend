import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Heading from './heading';
import PlayerBox from './playerBox';

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

  const renderPlayerIdentity = (item, index) => {
    
    return (
      <span>{index+1}.{" "}<span className=''></span><PlayerBox
        className=" cursor-pointer"
        onClick={() => navigateToProfile(item.walletAddress)}
        player={item}
      /></span>
      
      

    );
  };

  const renderDataBasedOnTab = (item, index) => {
    var winnings = !isNaN(item.winnings) ? item.winnings : 0;
    switch (activeTab) {
      case 'tab1': // Elo
        return <>{renderPlayerIdentity(item, index)} {item.elo}</>;
      case 'tab2': // Wins
        return <>{renderPlayerIdentity(item, index)} {item.won}</>;
      case 'tab3': // Winnings
      return <>{renderPlayerIdentity(item, index)} <span>{winnings.toFixed(2)} <span className='text-micro'>SOL</span></span></>;

      default:
        return '';
    }
  };

  return (
    <>
    
    <div className="container mx-auto p-0 md:p-4">
    <Heading>Leaderboard</Heading>
      <div className="flex w-full space-x-2 mb-4">
        <TabButton label="Elo" tab="tab1" />
        <TabButton label="Wins" tab="tab2" />
        <TabButton label="Winnings" tab="tab3" />
      </div>

      <div className="bg-gray-800 shadow rounded-lg p-4 text-white">
        <ul className='list-decimal list-inside'>
          {leaderboardData.map((item, index) => (
            <li key={index} className={`py-2 flex justify-between  border-b border-gray-700 ${index === 0 ? 'font-bold' : ''}`}>
              {renderDataBasedOnTab(item, index)}
            </li>
          ))}
        </ul>
      </div>
    </div>
    </>
  );
};

export default Leaderboard;
