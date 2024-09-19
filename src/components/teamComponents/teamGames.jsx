import React, { useEffect, useState } from 'react';
import MetricCard from './metricCard';
import axios from 'axios';
import { getGamesData } from './apiService';
import UserDetail from './userDetail';
import { toast } from 'react-toastify';
import ChessViewToolCard from './chessViewToolCard';

function TeamGames({ token }) {
    axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION;

    const [data, setData] = useState({
        toReview: 'loading...',
        allGames: 'loading...',
        dailyGames: 'loading...',
        reportedRatio: 'loading',
    });

    const [gamesToReview, setGamesToReview] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(8);

    const [whiteUser, setWhiteUser] = useState(null);
    const [blackUser, setBlackUser] = useState(null);
    const [currentGame, setCurrentGame] = useState(null);
    const [currentGameIndex, setCurrentGameIndex] = useState(0);

    // Button style variable
    const buttonStyles = (group) => `
        px-4 py-2 rounded-full border-2 transition-all ease-in-out duration-300 
        ${selectedGroup === group ? 'bg-purple-800 text-white border-purple-800' :
            'bg-white text-purple-800 border-purple-800 hover:bg-purple-800 hover:text-white'}
    `;

    const fetchGames = async (group) => {
        try {
            const response = await axios.get('/gamesToReview', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    group,
                },
            });
            setGamesToReview(response.data.games);
        } catch (error) {
            console.error('Error fetching games to review:', error);
        }
    };

    const handleGroupClick = (group) => {
        setSelectedGroup(group);
        fetchGames(group);
    };
    const fetchUsers = async () => {
        try {
            if (gamesToReview.length >= 1 && currentGameIndex < gamesToReview.length) {
                console.log(gamesToReview.length, currentGameIndex);
                
                let white = gamesToReview[currentGameIndex].white;
                let black = gamesToReview[currentGameIndex].black;

                const whiteUserData = await axios.get("/user/" + white);
                const blackUserData = await axios.get("/user/" + black);

                setWhiteUser(whiteUserData.data);
                setBlackUser(blackUserData.data);
            }else{
                setWhiteUser(null);
                setBlackUser(null);
                setCurrentGame(null);
            }
        } catch (error) {
            toast.error('Error fetching user data');
            console.log(error);
            
        }
    };


    useEffect(() => {
        if (gamesToReview.length >= 1 && currentGameIndex < gamesToReview.length) {
            setCurrentGame(gamesToReview[currentGameIndex])
            fetchUsers();
        }else{
            setWhiteUser(null);
            setBlackUser(null);
            setCurrentGame(null);
        }
    }, [currentGameIndex, gamesToReview]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getGamesData();
                setData({
                    toReview: result.toReview,
                    allGames: result.allGamesCount,
                    dailyGames: result.dailyGamesCount,
                    reportedRatio: result.reportedRatio + "%"
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 60000); // Refresh data every minute
        return () => clearInterval(intervalId);
    }, []);
    const handleGameUpdate = () => {
        if (currentGameIndex + 1 <= gamesToReview.length) {
            setCurrentGameIndex(currentGameIndex + 1)
        } else {
            setWhiteUser(null);
            setBlackUser(null);
            setCurrentGame(null);
        }
    };

    return (
        <div>
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="To Review" value={data.toReview} icon="toReview" color="text-purple-700" />
                <MetricCard title="All Games" value={data.allGames} icon="allGames" color="text-purple-700" />
                <MetricCard title="Daily Games" value={data.dailyGames} icon="dailyGames" color="text-purple-700" />
                <MetricCard title="Reported Ratio" value={data.reportedRatio} icon="reportedRatio" color="text-purple-700" />
            </div>

            {/* Subheading */}
            <h2 className="text-purple-500 font-semibold text-xl mt-8 text-center">Games to Review</h2>

            {/* Group Buttons */}
            <div className="flex justify-center space-x-4 my-6">
                <button onClick={() => handleGroupClick(0)} className={buttonStyles(0)}>All Games</button>
                <button onClick={() => handleGroupClick(1)} className={buttonStyles(1)}>Group 1</button>
                <button onClick={() => handleGroupClick(2)} className={buttonStyles(2)}>Group 2</button>
                <button onClick={() => handleGroupClick(3)} className={buttonStyles(3)}>Group 3</button>
                <button onClick={() => handleGroupClick(4)} className={buttonStyles(4)}>Group 4</button>
            </div>

            {/* Display games to review */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <UserDetail user={whiteUser} token={token} onUserUpdate={fetchUsers} className="border-white border" />
                <div className=' col-span-2'>
                    <ChessViewToolCard game={currentGame} token={token} onUpdate={handleGameUpdate} />
                </div>
                <UserDetail user={blackUser} token={token} onUserUpdate={fetchUsers} className="border-black border" />
            </div>
        </div>
    );
}

export default TeamGames;
