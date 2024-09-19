// apiService.js
import axios from 'axios';
import { PublicKey } from '@solana/web3.js';

// Function to get dashboard data
axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION
export const getDashboardData = async (connection) => {
   
    const [toReviewResponse, newUsersResponse, activeUsersResponse, dailyUserCountResponse, dailyBalanceCountResponse] = await Promise.all([
        axios.get('/countToReview'),
        axios.get('/countNewUsers'),
        axios.get('/activeUsers'),
        axios.get('/dailyUserCount'),
        axios.get('/dailyBalanceCount'),
    ]);
    
    let balanceInSol = 0;
    const publicKeyString = "4oxxEgtzADmgo3VH3aG2Hv2voUtoXGSisou8PGoqKCpD";
    const publicKey = new PublicKey(publicKeyString);
    
    if (connection) {
        try {
            const balanceInLamports = await connection.getBalance(publicKey, 'confirmed');
            if (balanceInLamports) {
                balanceInSol = Math.round((balanceInLamports / 1e9) * 1000) / 1000; // Convert lamports to SOL
            }
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    }

    return {
        toReview: toReviewResponse.data.gameCount,
        newUsers: newUsersResponse.data.userCount,
        activeUsers: activeUsersResponse.data.userCount,
        balance: balanceInSol + " SOL", // Include balance here
        dailyUserCount: dailyUserCountResponse.data.dailyCount,
        dailyBalanceCount: dailyBalanceCountResponse.data.dailyCount
    };
};


export const getUsersData = async () => {
    try {
        const [newUsersResponse, activeUsersResponse, dailyUserCountResponse, verifiedUsersResponse, totalUsersResponse, dailyVerifiedUserCountResponse] = await Promise.all([
            axios.get('/countNewUsers'),
            axios.get('/activeUsers'),
            axios.get('/dailyUserCount'),
            axios.get('/countVerifiedUsers'),
            axios.get('/countUsers'),
            axios.get('/dailyVerifiedUserCount'),
        ]);
        return {
            newUsers: newUsersResponse.data.userCount,
            activeUsers: activeUsersResponse.data.userCount,
            dailyUserCount: dailyUserCountResponse.data.dailyCount,
            verifiedUsers: verifiedUsersResponse.data.userCount,
            totalUsers: totalUsersResponse.data.userCount,
            dailyVerifiedUserCount: dailyVerifiedUserCountResponse.data.dailyCount,
            //dailyVerifiedUserCount: dailyVerifiedUserCountResponse.data.dailyCount
        };
    } catch (error) {
        console.error('Error fetching user tab data:', error);
        throw error;
    }
};

export const getGamesData = async () => {
    try {
        // Fetch data from all required endpoints
        const [toReviewResponse, allGamesCountResponse, dailyGamesCountResponse, reportedGamesResponse] = await Promise.all([
            axios.get('/countToReview'),
            axios.get('/countAllGames'),
            axios.get('/countDailyGames'),
            axios.get('/countReportedGames'),
        ]);

        // Extract data from responses
        const allGamesCount = allGamesCountResponse.data.gameCount;
        const reportedGamesCount = reportedGamesResponse.data.gameCount;

        // Calculate the reported ratio as a percentage
        const reportedRatio = allGamesCount > 0 ? (reportedGamesCount / allGamesCount * 100).toFixed(2) : '0';

        // Return the data with the computed reported ratio
        return {
            toReview: toReviewResponse.data.gameCount,
            allGamesCount: allGamesCount,
            dailyGamesCount: dailyGamesCountResponse.data.gameCount,
            reportedRatio: reportedRatio, // Percentage of reported games
        };
    } catch (error) {
        console.error('Error fetching games tab data:', error);
        throw error;
    }
};

export const getFInanceData = async (connection) => {
   
    const [dailyProfitResponse, totalProfitResponse, claimedAmountResponse, profitByDayResponse, dailyBalanceCountResponse, claimHistoryResponse] = await Promise.all([
        axios.get('/dailyProfit'),
        axios.get('/totalProfit'),
        axios.get('/claimedAmount'),
        axios.get('/profitByDay'),
        axios.get('/dailyBalanceCount'),
        axios.get('/claimHistory'),
    ]);
    
    let balanceInSol = 0;
    const publicKeyString = "4oxxEgtzADmgo3VH3aG2Hv2voUtoXGSisou8PGoqKCpD";
    const publicKey = new PublicKey(publicKeyString);
    
    if (connection) {
        try {
            const balanceInLamports = await connection.getBalance(publicKey, 'confirmed');
            if (balanceInLamports) {
                balanceInSol = Math.round((balanceInLamports / 1e9) * 1000) / 1000; // Convert lamports to SOL
            }
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    }
    console.log(dailyProfitResponse);
    

    return {
        dailyProfit: dailyProfitResponse.data.profit + " SOL",
        totalProfit: totalProfitResponse.data.profit + " SOL",
        toClaim: (totalProfitResponse.data.profit - claimedAmountResponse.data.amount).toFixed(3),
        balance: balanceInSol + " SOL", // Include balance here
        profitByDayCount: profitByDayResponse.data.dailyCount,
        dailyBalanceCount: dailyBalanceCountResponse.data.dailyCount,
        claimHistory: claimHistoryResponse.data.history
    };
};