// src/utils.js

export const calculateNewUsersPerDay = (dailyCount) => {
    let newUserCountData = [];
    for (let i = 1; i < dailyCount.length; i++) {
        const newUserCount = dailyCount[i].value - dailyCount[i - 1].value;
        newUserCountData.push({
            date: dailyCount[i].date,
            value: newUserCount,
        });
    }
    return newUserCountData;
};

export const getGraphColor = (data) => {
    if (data.length < 2) return 'blue'; // Not enough data to compare
    const last = data[data.length - 1].value;
    const secondLast = data[data.length - 2].value;
    if (last > secondLast) return 'green';
    if (last < secondLast) return 'red';
    return 'blue';
};
