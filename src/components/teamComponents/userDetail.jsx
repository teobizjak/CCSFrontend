import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaCheck, FaTimes, FaEdit } from 'react-icons/fa';
import ProfilePhoto from '../profilePhoto';
import { BorderColorClass } from '../../functions/borderColorClass';
import { toast } from 'react-toastify';

const UserDetail = ({ user, token, onUserUpdate, className }) => {
    const [editMode, setEditMode] = useState(false);
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [trustFactor, setTrustFactor] = useState(user?.trustFactor || 1);
    const [banned, setBanned] = useState(user?.banned || false);
    const [picture, setPicture] = useState(user?.picture || '');
    const [tier, setTier] = useState(user?.tier || 0);
    const [verified, setVerified] = useState(user?.verified || false);
    const [verifyElo, setVerifyElo] = useState(user?.verifyElo || 0);
    const [elo, setElo] = useState(user?.elo || 0);

    useEffect(() => {
        setEditMode(false);
        setFirstName(user?.firstName || '');
        setLastName(user?.lastName || '');
        setTrustFactor(user?.trustFactor || 1);
        setBanned(user?.banned || false);
        setPicture(user?.picture || '');
        setTier(user?.tier || 0);
        setVerified(user?.verified || false);
        setVerifyElo(user?.verifyElo || 0);
        setElo(user?.elo || 0);
    }, [user]);

    const calculateProfit = (winnings, paid) => {
        return (winnings - paid).toFixed(2);
    };

    const onUpdate = async (userData) => {
        try {
            console.log("update user with", userData);
            
            const response = await axios.post('/userUpdateTeam', userData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.valid) {
                toast.success('User updated successfully!');
                onUserUpdate(user.walletAddress);
            } else {
                toast.error('Failed to update user.');
            }
        } catch (error) {
            toast.error('An error occurred while updating the user.');            
        }
    };

    const handleSave = () => {
        onUpdate({
            walletAddress: user.walletAddress,
            firstName,
            lastName,
            trustFactor,
            banned,
            picture,
            tier,
            verified,
            verifyElo,
            elo
        });
        setEditMode(false);
    };

    const handleReset = () => {
        setEditMode(false);
        setFirstName(user?.firstName || '');
        setLastName(user?.lastName || '');
        setTrustFactor(user?.trustFactor || 1);
        setBanned(user?.banned || false);
        setPicture(user?.picture || '');
        setTier(user?.tier || 1);
        setVerified(user?.verified || false);
        setVerifyElo(user?.verifyElo || 0);
        setElo(user?.elo || 0);
    };

    const truncateWalletAddress = (walletAddress) => {
        return walletAddress.length > 6 ? `${walletAddress.substring(0, 6)}...` : walletAddress;
    };

    if (!user) {
        return <div className="p-6 text-white bg-gray-800 rounded-lg">Select a user to see details</div>;
    }

    const displayName = (user.firstName && user.lastName)
        ? `${user.firstName} ${user.lastName}`
        : truncateWalletAddress(user.walletAddress);

    return (
        <div className={`p-8 bg-gray-900 rounded-xl shadow-xl flex flex-col items-center space-y-6 ${className}`}>
            <div className="w-32 h-32 relative mb-4">
                <ProfilePhoto
                    src={user.picture || ''}
                    className="h-full w-full object-cover rounded-full"
                    bgColor={BorderColorClass(user.elo || 0)}
                    alt="Profile"
                />
            </div>
            {editMode ? (
                <>
                    <h3 className="text-2xl font-bold text-gray-100 mb-4">Editing: {displayName}</h3>
                    <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
                        <label className="text-gray-100 text-center">First Name</label>
                        <input
                            type="text"
                            className="bg-gray-800 p-3 rounded-lg text-white placeholder-gray-500 w-full text-center"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                        <label className="text-gray-100 text-center">Last Name</label>
                        <input
                            type="text"
                            className="bg-gray-800 p-3 rounded-lg text-white placeholder-gray-500 w-full text-center"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                        <label className="text-gray-100 text-center">Trust Factor</label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            className="bg-gray-800 p-3 rounded-lg text-white placeholder-gray-500 w-full text-center"
                            value={trustFactor}
                            onChange={(e) => setTrustFactor(e.target.value)}
                        />
                        <label className="text-gray-100 text-center">Tier</label>
                        <input
                            type="number"
                            min="1"
                            className="bg-gray-800 p-3 rounded-lg text-white placeholder-gray-500 w-full text-center"
                            value={tier}
                            onChange={(e) => setTier(e.target.value)}
                        />
                        <label className="text-gray-100 text-center">ELO</label>
                        <input
                            type="number"
                            className="bg-gray-800 p-3 rounded-lg text-white placeholder-gray-500 w-full text-center"
                            value={elo}
                            onChange={(e) => setElo(e.target.value)}
                        />
                        <label className="text-gray-100 text-center">Verified ELO</label>
                        <input
                            type="number"
                            className="bg-gray-800 p-3 rounded-lg text-white placeholder-gray-500 w-full text-center"
                            value={verifyElo}
                            onChange={(e) => setVerifyElo(e.target.value)}
                        />
                        <div className="flex items-center col-span-2 justify-center space-x-6">
                            <label className="flex items-center text-gray-100">
                                <input
                                    type="checkbox"
                                    className="mr-2 accent-blue-500"
                                    checked={verified}
                                    onChange={(e) => setVerified(e.target.checked)}
                                />
                                <span>Verified</span>
                            </label>
                            <label className="flex items-center text-gray-100">
                                <input
                                    type="checkbox"
                                    className="mr-2 accent-blue-500"
                                    checked={banned}
                                    onChange={(e) => setBanned(e.target.checked)}
                                />
                                <span>Banned</span>
                            </label>
                        </div>
                        <div className="flex col-span-2 justify-center space-x-4">
                            <button
                                onClick={handleReset}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors w-full max-w-xs"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full max-w-xs"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <h3 className="text-3xl font-bold text-gray-100">{displayName}</h3>
                    <div className="grid grid-cols-2 gap-4 text-gray-300 w-full max-w-lg">
                        <p className="text-center"><span className="font-semibold">Wallet:</span> {truncateWalletAddress(user.walletAddress) || 'N/A'}</p>
                        <p className="text-center"><span className="font-semibold">ELO:</span> {user.elo || 'N/A'}</p>
                        <p className="text-center"><span className="font-semibold">Wins:</span> {user.won || 0}</p>
                        <p className="text-center"><span className="font-semibold">Losses:</span> {user.lost || 0}</p>
                        <p className="text-center"><span className="font-semibold">Draws:</span> {user.drawn || 0}</p>
                        <p className="text-center"><span className="font-semibold">Winnings:</span> {user.winnings.toFixed(3) || 0.000}</p>
                        <p className="text-center"><span className="font-semibold">Paid:</span> {user.paid.toFixed(3) || 0.000}</p>
                        <p className="text-center"><span className="font-semibold">Profit:</span> {calculateProfit(user.winnings || 0, user.paid || 0)}</p>
                        <p className="text-center"><span className="font-semibold">Reported:</span> {user.reported || 0}</p>
                        <p className="text-center"><span className="font-semibold">Trust Factor:</span> {user.trustFactor || 'N/A'}</p>
                        <p className="text-center">
                            <span className="font-semibold">Verified:</span> 
                            {user.verified ? <FaCheck className="text-green-500 inline-block ml-2" /> : <FaTimes className="text-red-500 inline-block ml-2" />}
                        </p>
                        <p className="text-center"><span className="font-semibold">Verified ELO:</span> {user.verifyElo || 'N/A'}</p>
                        <p className="text-center">
                            <span className="font-semibold">Banned:</span> 
                            {banned ? <FaCheck className="text-green-500 inline-block ml-2" /> : <FaTimes className="text-red-500 inline-block ml-2" />}
                        </p>
                        <p className="text-center"><span className="font-semibold">Tier:</span> {user.tier || 'N/A'}</p>
                    </div>
                    <button
                        onClick={() => setEditMode(true)}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg mt-4 transition-colors"
                    >
                        <FaEdit className="inline-block mr-2" /> Edit
                    </button>
                </>
            )}
        </div>
    );
};

export default UserDetail;
