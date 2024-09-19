// UsersTable.js
import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const UsersTable = ({ onRowClick }) => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    useEffect(() => {
        fetchUsers();
    }, [currentPage, sortField, sortOrder, searchQuery]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/allUsers', {
                params: {
                    page: currentPage,
                    sortField,
                    sortOrder,
                    search: searchQuery,
                },
            });
            setUsers(response.data.users);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleSort = (field) => {
        setSortOrder(sortField === field && sortOrder === 'asc' ? 'desc' : 'asc');
        setSortField(field);
    };

    const handlePagination = (direction) => {
        if (direction === 'prev' && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        } else if (direction === 'next' && currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const calculateWinPercentage = (won, lost, drawn) => {
        const totalGames = won + lost + drawn;
        return totalGames === 0 ? 0 : ((won / totalGames) * 100).toFixed(2);
    };

    const calculateProfit = (winnings, paid) => {
        return (winnings - paid).toFixed(2);
    };

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <div className="p-4">
                <input
                    type="text"
                    className="w-full p-2 rounded bg-gray-800 text-white"
                    placeholder="Search by Wallet Address or Name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs uppercase bg-gray-700 text-gray-400">
                    <tr>
                        <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('walletAddress')}>Wallet Address</th>
                        <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('wld')}>W/L/D</th>
                        <th className="px-6 py-3">Win %</th>
                        <th className="px-6 py-3">Profit</th>
                        <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('elo')}>ELO</th>
                        <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('reported')}>Reported</th>
                        <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('verified')}>Verified</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr
                            key={user.walletAddress}
                            className="bg-gray-800 border-b border-gray-700 hover:bg-gray-750 cursor-pointer"
                            onClick={() => onRowClick(user.walletAddress)}
                        >
                            <td className="px-6 py-4 font-medium text-white">{user.walletAddress.slice(0, 5) + '...'}</td>
                            <td className="px-6 py-4">{user.won}/{user.lost}/{user.drawn}</td>
                            <td className="px-6 py-4">{calculateWinPercentage(user.won, user.lost, user.drawn)}%</td>
                            <td className="px-6 py-4">{calculateProfit(user.winnings, user.paid)}</td>
                            <td className="px-6 py-4">{user.elo}</td>
                            <td className="px-6 py-4">{user.reported}</td>
                            <td className="px-6 py-4">{user.verified ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-between items-center p-4 bg-gray-700">
                <button onClick={() => handlePagination('prev')} disabled={currentPage === 1} className="text-white bg-gray-800 hover:bg-gray-600 px-3 py-1 rounded">
                    Previous
                </button>
                <span className="text-gray-400">Page {currentPage} of {totalPages}</span>
                <button onClick={() => handlePagination('next')} disabled={currentPage === totalPages} className="text-white bg-gray-800 hover:bg-gray-600 px-3 py-1 rounded">
                    Next
                </button>
            </div>
        </div>
    );
};

export default UsersTable;
