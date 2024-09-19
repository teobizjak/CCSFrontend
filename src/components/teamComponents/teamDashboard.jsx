import React, { useState, useEffect } from 'react';
import { getDashboardData } from './apiService';
import { calculateNewUsersPerDay, getGraphColor } from './utils';
import MetricCard from './metricCard';
import Graph from './graph';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useConnection } from '@solana/wallet-adapter-react';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function TeamDashboard() {
    const { connection } = useConnection(); // Ensure connection is properly initialized
    const [data, setData] = useState({
        toReview: 'loading...',
        newUsers: 'loading...',
        activeUsers: 'loading...',
        balance: 'loading...',
    });
    const [newUserCountData, setNewUserCountData] = useState([]);
    const [balanceCountData, setBalanceCountData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getDashboardData(connection);                
                setData({
                    toReview: result.toReview,
                    newUsers: result.newUsers,
                    activeUsers: result.activeUsers,
                    balance: result.balance || 'N/A',
                });

                const calculatedNewUsers = calculateNewUsersPerDay(result.dailyUserCount || []);
                setNewUserCountData(calculatedNewUsers);
                setBalanceCountData(result.dailyBalanceCount || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 60000);
        return () => clearInterval(intervalId);
    }, [connection]); // Ensure `connection` is a dependency

    const newUserCountColor = getGraphColor(newUserCountData);
    const balanceCountColor = getGraphColor(balanceCountData);

    const newUserCountGraphData = {
        labels: newUserCountData.map(entry => new Date(entry.date).toLocaleDateString()),
        datasets: [
            {
                label: 'New Users per Day',
                data: newUserCountData.map(entry => entry.value),
                fill: false,
                borderColor: newUserCountColor,
                tension: 0.1,
            }
        ]
    };

    const balanceGraphData = {
        labels: balanceCountData.map(entry => new Date(entry.date).toLocaleDateString()),
        datasets: [
            {
                label: 'Balance in SOL',
                data: balanceCountData.map(entry => entry.value),
                fill: false,
                borderColor: balanceCountColor,
                tension: 0.1,
            }
        ]
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="To Review"
                    value={data.toReview}
                    icon="toReview"
                    color="text-purple-700"
                />
                <MetricCard
                    title="New Users"
                    value={data.newUsers}
                    icon="newUsers"
                    color="text-purple-700"
                />
                <MetricCard
                    title="Active Users"
                    value={data.activeUsers}
                    icon="activeUsers"
                    color="text-purple-700"
                />
                <MetricCard
                    title="Balance"
                    value={data.balance}
                    icon="balance"
                    color="text-purple-700"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <Graph data={newUserCountGraphData} loading={loading} />
                <Graph data={balanceGraphData} loading={loading} />
            </div>
            
        </div>
    );
}

export default TeamDashboard;
