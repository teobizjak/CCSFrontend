import React, { useEffect, useState } from 'react'
import MetricCard from './metricCard';
import Graph from './graph';
import {  getGraphColor } from './utils';
import { useConnection } from '@solana/wallet-adapter-react';
import {  getFInanceData } from './apiService';
import ClaimSection from './claimSection';
import ClaimHistory from './claimHistory';

function TeamFinances() {
  const { connection } = useConnection(); // Ensure connection is properly initialized
    const [data, setData] = useState({
        totalProfit: 'loading...',
        toClaim: 'loading...',
        dailyProfit: 'loading...',
        balance: 'loading...',
    });
    const [toClaim, setToClaim] = useState(0);
    const [profitByDayCountData, setProfitByDayCountData] = useState([]);
    const [balanceCountData, setBalanceCountData] = useState([]);
    const [claimHistory, setClaimHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getFInanceData(connection);                
                setData({
                    dailyProfit: result.dailyProfit,
                    totalProfit: result.totalProfit,
                    toClaim: result.toClaim + " SOL",
                    balance: result.balance || 'N/A',
                });
                setToClaim(result.toClaim)
                setProfitByDayCountData(result.profitByDayCount || []);
                setBalanceCountData(result.dailyBalanceCount || []);
                setClaimHistory(result.claimHistory || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 60000);
        return () => clearInterval(intervalId);
    }, [connection]); // Ensure `connection` is a dependency

    const profitByDayCountColor = getGraphColor(profitByDayCountData);
    const balanceCountColor = getGraphColor(balanceCountData);

    const profitByDayCountGraphData = {
      
        labels: profitByDayCountData.map(entry => new Date(entry.date).toLocaleDateString()),
        datasets: [
            {
                label: 'Profit by Day in SOL',
                data: profitByDayCountData.map(entry => entry.value),
                fill: false,
                borderColor: profitByDayCountColor,
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
                    title="Total Profit"
                    value={data.totalProfit}
                    icon="totalProfit"
                    color="text-purple-700"
                />
                <MetricCard
                    title="Daily Profit"
                    value={data.dailyProfit}
                    icon="dailyProfit"
                    color="text-purple-700"
                />
                <MetricCard
                    title="To Claim"
                    value={data.toClaim}
                    icon="toClaim"
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
                <Graph data={profitByDayCountGraphData} loading={loading} />
                <Graph data={balanceGraphData} loading={loading} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <ClaimHistory data={claimHistory}/>
                <ClaimSection claimAmount={toClaim}/>
            </div>
            
        </div>
    );
}

export default TeamFinances