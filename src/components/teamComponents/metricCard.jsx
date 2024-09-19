import React from 'react';
import { FaEye, FaUserPlus, FaBolt, FaWallet, FaUsers, FaUserCheck, FaChess, FaTachometerAlt, FaFlag, FaChartLine, FaChartBar, FaCoins } from 'react-icons/fa';

const MetricCard = ({ title, value, icon, color }) => {
    const iconMap = {
        toReview: <FaEye className={`text-5xl ${color}`} />,
        newUsers: <FaUserPlus className={`text-5xl ${color}`} />,
        activeUsers: <FaBolt className={`text-5xl ${color}`} />,
        totalUsers: <FaUsers className={`text-5xl ${color}`} />,
        verifiedUsers: <FaUserCheck className={`text-5xl ${color}`} />,
        balance: <FaWallet className={`text-5xl ${color}`} />,
        allGames: <FaChess className={`text-5xl ${color}`} />,
        dailyGames: <FaTachometerAlt className={`text-5xl ${color}`} />,
        reportedRatio: <FaFlag className={`text-5xl ${color}`} />,
        totalProfit: <FaChartLine className={`text-5xl ${color}`} />,
        dailyProfit: <FaChartBar className={`text-5xl ${color}`} />,
        toClaim: <FaCoins className={`text-5xl ${color}`} />,
    };

    return (
        <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-xl p-6 flex items-center justify-between shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 cursor-default">
            <div>
                <h3 className="text-sm font-medium text-gray-400 uppercase">{title}</h3>
                <p className="text-4xl font-extrabold text-white mt-2">{value}</p>
            </div>
            {iconMap[icon]}
        </div>
    );
};

export default MetricCard;
