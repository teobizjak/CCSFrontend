import React, { useState, useEffect } from 'react';
import UsersTable from './usersTable';
import UserDetail from './userDetail';
import { getUsersData } from './apiService';
import { calculateNewUsersPerDay, getGraphColor } from './utils';
import MetricCard from './metricCard';
import Graph from './graph';
import axios from 'axios';

function TeamUsers({token}) {
    const [data, setData] = useState({
        totalUsers: 'loading...',
        newUsers: 'loading...',
        activeUsers: 'loading...',
        verifiedUsers: 'loading...',
    });
    const [newUserCountData, setNewUserCountData] = useState([]); // Initialize as empty array
    const [verifiedUserCountData, setVerifiedUserCountData] = useState([]); // Initialize as empty array
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getUsersData();
                setData({
                    totalUsers: result.totalUsers,
                    newUsers: result.newUsers,
                    activeUsers: result.activeUsers,
                    verifiedUsers: result.verifiedUsers || 'N/A',
                });

                const calculatedNewUsers = calculateNewUsersPerDay(result.dailyUserCount || []);
                setNewUserCountData(calculatedNewUsers);
                setVerifiedUserCountData(result.dailyVerifiedUserCount || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 60000); // Refresh data every minute
        return () => clearInterval(intervalId);
    }, []);

    const handleRowClick = async (walletAddress) => {
        try {
            const response = await axios.get(`/user/${walletAddress}`);
            setSelectedUser(response.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    // Safely map over the data, providing fallback empty array
    const newUserCountGraphData = {
        labels: (newUserCountData || []).map(entry => new Date(entry.date).toLocaleDateString()),
        datasets: [
            {
                label: 'New Users per Day',
                data: (newUserCountData || []).map(entry => entry.value),
                fill: false,
                borderColor: getGraphColor(newUserCountData),
                tension: 0.1,
            }
        ]
    };

    const verifiedUserGraphData = {
        labels: (verifiedUserCountData || []).map(entry => new Date(entry.date).toLocaleDateString()),
        datasets: [
            {
                label: 'Verified Users per Day',
                data: (verifiedUserCountData || []).map(entry => entry.value),
                fill: false,
                borderColor: getGraphColor(verifiedUserCountData),
                tension: 0.1,
            }
        ]
    };
    const handleUserUpdate = (walletAddress) => {
        handleRowClick(walletAddress)
    };


    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Total Users" value={data.totalUsers} icon="totalUsers" color="text-purple-700" />
                <MetricCard title="New Users" value={data.newUsers} icon="newUsers" color="text-purple-700" />
                <MetricCard title="Active Users" value={data.activeUsers} icon="activeUsers" color="text-purple-700" />
                <MetricCard title="Verified Users" value={data.verifiedUsers} icon="verifiedUsers" color="text-purple-700" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <Graph data={newUserCountGraphData} loading={loading} />
                <Graph data={verifiedUserGraphData} loading={loading} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <UsersTable onRowClick={handleRowClick} />
                <div className="self-start">
                    <UserDetail user={selectedUser} token={token} onUserUpdate={handleUserUpdate}/>
                </div>
            </div>
        </div>
    );
}

export default TeamUsers;
