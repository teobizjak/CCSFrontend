import React, { useCallback } from 'react'
import UserTitleBox from './userTitleBox'
import ProfilePhoto from './profilePhoto'
import { BorderColorClass } from '../functions/borderColorClass'
import { useNavigate } from 'react-router-dom'

function GameUserData({ user, timer, name, isPlaying=false }) {
    const formatTime = useCallback((time) => {
        const minutes = Math.floor(time / 60)
        const seconds = time % 60
        return `${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}`
    }, [])
    const navigate = useNavigate();
    return (
        <>
            <>
  <div className="text-xl font-semibold relative flex items-center">
    <div className=" h-12 w-12 overflow-hidden rounded-full shadow mr-2">
      <ProfilePhoto
        src={user.picture || "unknown"}
        className="h-full w-full object-cover"
        bgColor={BorderColorClass(user.elo)}
        alt="Profile"
      />
    </div>
    <span className='relative'>
      <span className='cursor-pointer hover:text-purple-500 transition duration-700' onClick={()=>{ isPlaying === false && navigate(`/profile/${user.walletAddress}`)}}>
      {user.firstName || user.lastName
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
        : user.walletAddress.slice(0,8) + "..."}
      </span>
      
      {"(" + user.elo + ")"}
      <UserTitleBox user={user} />
    </span>
    
  </div>
  <p className={`text-right text-xl font-medium px-4 py-3 rounded-lg transition-colors duration-700 ${timer < 60 ? "bg-red-900 animate-pulse" : "bg-gray-900"}`}>
  {timer < 0 ? "00:00" : formatTime(timer)}
    </p>
</>

        </>
    )
}

export default GameUserData