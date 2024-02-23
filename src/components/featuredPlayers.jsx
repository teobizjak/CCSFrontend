import React, { useEffect, useState } from 'react';
import ProfilePhoto from './profilePhoto';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BorderColorClass } from '../functions/borderColorClass';
import UserTitleBox from './userTitleBox';

const FeaturedPlayers = () => {
    // Set the base URL for axios requests
    axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION;

    const [players, setPlayers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFeaturedPlayers = async () => {
            try {
                const response = await axios.get('/featuredPlayers');
                console.log(response.data);
                if (response.data && response.data.players) {
                    setPlayers(response.data.players);
                }
            } catch (error) {
                console.error('Failed to fetch featured players:', error);
                // Handle error appropriately. You might want to set some error state here.
            }
        };

        fetchFeaturedPlayers();
    }, []);

    if (players.length === 0) return <></>;

    return (
        <div className='md:p-4 md:w-auto sm:w-72 sm:px-0'>
            <h2 className="text-xl font-semibold mb-4 text-purple-400">Featured Players</h2>
            <div className="rounded-lg bg-gray-800 p-4 shadow-lg">
                <ul>
                    {players.map((player, index) => (
                        <li key={index} className="flex items-center justify-between py-2 border-b border-gray-700">
                            <div className="flex items-center">
                                <ProfilePhoto className="h-10 w-10 rounded-full" src={player.picture || "avatar"} bgColor={BorderColorClass(player.elo)} alt={player.name} />
                                <span className="font-semibold ml-3 text-gray-300 hover:text-purple-400 transition-colors duration-500 cursor-pointer relative" onClick={() =>{navigate(`/profile/${player.walletAddress}`)}}>{player.firstName || player.lastName
                                    ? `${player.firstName || ''} ${player.lastName || ''}`.trim()
                                    : player.walletAddress.slice(0, 8) + "..."}<UserTitleBox user={player} /></span>
                            </div>
                            <span className="text-sm text-gray-300">{player.elo} ELO</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default FeaturedPlayers;
