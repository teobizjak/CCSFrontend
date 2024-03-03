import React, { useEffect, useState } from 'react'
import ProfilePhoto from './profilePhoto'
import Heading from './heading'
import UserTitleBox from './userTitleBox'
import { useNavigate } from 'react-router-dom'
import { BorderColorClass } from '../functions/borderColorClass'
import { FaBrain, FaMoneyBillWave, FaWallet } from 'react-icons/fa'


function ProfileInfo({ user, isOwned, setIsEditOpen }) {
    const navigate = useNavigate();
    const profit = user.winnings - user.paid;
    const profitClass = profit >= 0 ? 'text-green-500' : 'text-red-500';

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
                        <div className="text-sm opacity-75 flex gap-1 items-center">
                            <FaWallet/> <span className=' hidden md:inline'>Address:</span>{' '}
                            {user.walletAccount?.slice(0, 8)}...
                        </div>
                        <div className="text-sm opacity-75 flex gap-1 items-center">
                            <FaBrain/><span className=' hidden md:inline'>ELO:</span>{' '} {user.elo}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-sm opacity-75 ">
                            <FaMoneyBillWave/>
                            <span className=' hidden md:inline'>Profit:</span>{' '}
                            <span className={`${profitClass}`}>{profit.toFixed(3)}{' '}</span>
                            
                            SOL
                        </div>
                    </div>
                </div>

                <div className="mt-8 space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-white">
                        <div className="flex items-center">
                            Wins: {user.won}
                        </div>
                        <div className="flex items-center">
                            Draws: {user.drawn}
                        </div>
                        <div className="flex items-center">
                            Defeats: {user.lost}
                        </div>
                    </div>

                    <div className="flex justify-between text-white">
                        <div className="flex items-center">
                            Paid: {user.paid.toFixed(3)} SOL
                        </div>
                        <div className="flex items-center">
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