import React from 'react';

const RecentActivity = ({ activities }) => {
    if (!activities || activities.length === 0) {
        return <div className="p-4 text-gray-400">No recent activity.</div>;
    }

    return (
        <div className='p-4'>
            <h2 className="text-xl font-semibold mb-4 text-purple-400">Recent Activity</h2>
            <div className="rounded-lg bg-gray-800 p-4 shadow-lg">
                <ul>
                    {activities.map((activity, index) => (
                        <li key={index} className="border-b border-gray-700 py-2">
                            <div className="text-gray-300">
                                <span className="font-semibold">{activity.type}:</span> {activity.description}
                            </div>
                            <div className="text-sm text-gray-500">{activity.date}</div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default RecentActivity;
