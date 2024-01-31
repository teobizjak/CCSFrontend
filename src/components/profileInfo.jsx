import React, { useEffect, useState } from 'react'
import ProfilePhoto from './profilePhoto'
import Heading from './heading'
import UserTitleBox from './userTitleBox'
import { useNavigate } from 'react-router-dom'
import { BorderColorClass } from '../functions/borderColorClass'


function ProfileInfo({ user, isOwned, setIsEditOpen }) {
    const navigate = useNavigate();

    useEffect(() => {
        
        
    }, [user.elo]); 
    return (
        <div>

            <Heading>Profile Info</Heading>
            <div className="rounded-lg bg-gray-800 p-4 shadow-lg">
                <div className="flex items-center gap-4">
                    <div className={`h-24 w-24 overflow-hidden rounded-full shadow`}>
                        <ProfilePhoto
                            src={user.picture}
                            className="h-full w-full object-cover"
                            bgColor={BorderColorClass(user.elo)}
                            alt="Profile"
                        />
                    </div>
                    <div className="text-white">
                        <div className="text-xl font-semibold relative">
                            {user.firstName || user.lastName
                                ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                                : 'Unknown'}
                            <UserTitleBox user={user} />
                        </div>
                        <div className="text-sm opacity-75">
                            Address:{' '}
                            {user.walletAccount?.slice(0, 8)}...
                        </div>
                        <div className="text-sm opacity-75">
                            ELO: {user.elo}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm opacity-75">
                            <i className="fas fa-chart-line text-purple-400"></i>
                            Profit:{' '}
                            {(user.winnings - user.paid).toFixed(3)}{' '}
                            SOL
                        </div>
                    </div>
                </div>

                <div className="mt-8 space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-white">
                        <div className="flex items-center">
                            <i className="fas fa-trophy text-yellow-400"></i>
                            Wins: {user.won}
                        </div>
                        <div className="flex items-center">
                            <i className="fas fa-handshake text-blue-400"></i>
                            Draws: {user.drawn}
                        </div>
                        <div className="flex items-center">
                            <i className="fas fa-skull-crossbones text-red-400"></i>
                            Defeats: {user.lost}
                        </div>
                    </div>

                    <div className="flex justify-between text-white">
                        <div className="flex items-center">
                            <i className="fas fa-wallet text-green-400"></i>
                            Paid: {user.paid.toFixed(3)} SOL
                        </div>
                        <div className="flex items-center">
                            <i className="fas fa-coins text-orange-400"></i>
                            Earned: {user.winnings.toFixed(3)} SOL
                        </div>
                    </div>

                    <div className="flex justify-between text-white">
                        <div className="flex items-center">
                            <i className="fas fa-cash-register text-pink-400"></i>
                            Not Claimed: {user.readyToRedeem} SOL
                        </div>
                        <div className="flex items-center">
                            <i className="fas fa-search text-teal-400"></i>
                            Under Review: {user.gamesUnderReview}
                        </div>
                    </div>
                    {
                        isOwned === true &&

                        <div className="mt-4 flex justify-around">
                            <button
                                className="rounded-lg bg-purple-800 px-4 py-2 font-bold text-white transition duration-300 ease-in-out hover:bg-purple-700"
                                onClick={() => setIsEditOpen(true)}
                            >
                                Edit Profile
                            </button>
                            <button className="rounded-lg bg-purple-800 px-4 py-2 font-bold text-white transition duration-300 ease-in-out hover:bg-purple-700" 
                            onClick={() => {navigate("/play");}}
                            >
                                Play
                            </button>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default ProfileInfo