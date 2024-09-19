import React from 'react';
import { Line } from 'react-chartjs-2';

const Graph = ({ data, loading }) => {
    return (
        <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-xl p-6 shadow-lg hover:shadow-xl transition duration-300">
            {!loading ? (
                <Line data={data} />
            ) : (
                <p className="text-white">Loading graph...</p>
            )}
        </div>
    );
};

export default Graph;
