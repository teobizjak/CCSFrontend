import React, { useEffect, useState } from 'react';
import tabs from '../../functions/teamTabs';
import { FaLock, FaPowerOff } from 'react-icons/fa';
import StatusIndicator from '../statusIndicator';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function TeamSidebar({ activeTab, setActiveTab }) {
    axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION
    const navigate = useNavigate();
    const [status, setStatus] = useState('unknown');

    useEffect(() => {
        const fetchStatus = async () => {
          try {
            const response = await axios.get('/status');
            
            if (response.status === 200) {
              setStatus('online');
            }
          } catch (error) {
            if (error.response) {
              if (error.response.status === 503) {
                setStatus('updating');
              } else if (error.response.status === 500) {
                setStatus('offline');
              }
            } else {
              setStatus('offline');
            }
          }
        };
    
        // Initial fetch when the component mounts
        fetchStatus();
    
        // Set up polling every 30 seconds
        const intervalId = setInterval(fetchStatus, 30000);
    
        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
      }, []);
  return (
    <div className='rounded-r bg-gray-950 flex flex-col p-6 items-center min-h-screen shadow-lg'>
      {/* Logo Section */}
      <div className="flex justify-between items-center space-x-3 pb-8 w-full">
        <img src="/logo192.png" className='w-8' alt="CryptoChess Logo" />
        <p className="text-2xl leading-6 text-white font-semibold tracking-wide">CryptoChess</p>
      </div>

      {/* Tabs Section */}
      <div className="flex flex-col justify-start pl-4 w-full border-gray-700 border-opacity-40 border-y space-y-3 py-5">
        {tabs.map((tab, index) => (
          <div
            key={index}
            onClick={() => setActiveTab(tab.name)}
            className={`flex items-center space-x-3 p-3 rounded-md cursor-pointer transition-colors duration-300 ${
              activeTab === tab.name ? 'bg-purple-900 text-white' : 'hover:bg-gray-800 text-gray-400'
            }`}
          >
            <div className="text-xl">
              {tab.icon}
            </div>
            <p className={`text-lg font-medium transition-colors duration-300 capitalize ${
              activeTab === tab.name ? 'text-white font-semibold' : 'text-gray-400'
            }`}>
              {tab.name}
            </p>
          </div>
        ))}
      </div>

      {/* Coming Soon Section */}
      <div className="flex flex-col justify-start pl-4 w-full border-gray-700 border-opacity-40 border-b space-y-3 py-5">
        <div className="flex items-center space-x-3 p-3 hover:bg-gray-800 rounded-md cursor-not-allowed transition-colors duration-300">
          <FaLock className="text-xl text-gray-400" />
          <p className="text-lg font-medium text-gray-400">Coming Soon</p>
        </div>
      </div>
       {/* Status and Logout Section */}
      <div className="mt-auto w-full space-y-4">
        <div className="flex justify-between items-center p-3 rounded-md">
          <p className="text-md font-medium text-gray-400">API Status</p>
          <StatusIndicator status={status} />
        </div>
        <div className="flex justify-between items-center p-3 rounded-md">
          <p className="text-md font-medium text-gray-400">Solana Status</p>
          <StatusIndicator status="maintenance" />
        </div>
        <div 
          onClick={() => {navigate("/");}} 
          className="flex items-center space-x-3 p-3 text-red-500 rounded-md cursor-pointer hover:bg-red-700 hover:text-white transition-colors duration-300"
        >
          <FaPowerOff className="text-xl " />
          <p className="text-lg font-medium">Logout</p>
        </div>
      </div>
    </div>
  );
}

export default TeamSidebar;
