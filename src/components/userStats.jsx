import React, { useEffect, useState } from 'react';

const UserStats = ({ user, streak, isUserDataNull = false }) => {
    const [profit, setProfit] = useState(0);
    useEffect(() => {
        setProfit(user.winnings - user.paid)
    }, [user])
    return (
        <div className='md:p-4 md:w-auto sm:w-64 sm:px-0 mb-8 md:mb-auto'>
            <h2 className="text-xl font-semibold mb-4 text-purple-400 text-center md:text-left">Your Stats</h2>
            <div className="rounded-lg bg-gray-800 p-4 shadow-lg">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Name:</span>
                        <span className="font-semibold text-gray-100">{isUserDataNull ? "Without name" :user.firstName || user.lastName
                            ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                            : user.walletAddress && user.walletAddress.slice(0, 8) + "..."}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Address:</span>
                        <span className="font-semibold text-gray-100">{isUserDataNull ? "Not connected":user.walletAddress && `${user.walletAddress.slice(0, 8)}...`}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Streak:</span>
                        <span className="font-semibold text-gray-100">{isUserDataNull ? "no games played":streak && streak.split('').map((char, index) => (
                            <span
                                key={index}
                                className={`font-semibold ${char === 'W' ? 'text-green-400' :
                                    char === 'D' ? 'text-white' :
                                        char === 'L' ? 'text-red-400' : ''
                                    }`}
                            >
                                {char}
                            </span>
                        ))}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Record (W/D/L):</span>
                        <span className="font-semibold text-gray-100">{isUserDataNull ? "0/0/0" : user.won + "/" + user.drawn + "/" + user.lost}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">ELO:</span>
                        <span className="font-semibold text-gray-100">{isUserDataNull ? "800" : user.elo}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Profit:</span>
                        {isUserDataNull ? <span className={`font-semibold text-white`}>
                            0 SOL
                        </span> : <span className={`font-semibold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {profit >= 0 ? `+${profit.toFixed(3)}` : profit.toFixed(3)} SOL
                        </span>}
                        
                    </div>
                </div>
            </div>
        </div>

    );
};

export default UserStats;
